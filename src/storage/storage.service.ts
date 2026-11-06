import {
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import * as path from 'path';
import multer from 'multer';
import { getSignedUrl as generatePresignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { PageSizes, PDFDocument } from 'pdf-lib';

const CONVERTIBLE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PAGE_MARGIN = 36; // 0.5in, en puntos PDF

@Injectable()
export class StorageService implements OnModuleInit {
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;

  // Cliente usado solo para firmar enlaces de descarga. Usa la URL pública
  // (la que ve el navegador) para que el enlace funcione fuera de Docker.
  private presigner: S3Client;
  private readonly logger = new Logger(StorageService.name);

  constructor(private config: ConfigService) {
    this.bucket = this.config.get<string>('RUSTFS_BUCKET')!;
    this.publicUrl = this.config.get<string>('RUSTFS_PUBLIC_URL')!;

    const baseConfig = {
      region: 'us-east-1',
      credentials: {
        accessKeyId: this.config.get<string>('RUSTFS_ACCESS_KEY')!,
        secretAccessKey: this.config.get<string>('RUSTFS_SECRET_KEY')!,
      },
      forcePathStyle: true,
    };

    this.s3 = new S3Client({
      ...baseConfig,
      endpoint: this.config.get<string>('RUSTFS_ENDPOINT'),
    });
    this.presigner = new S3Client({
      ...baseConfig,
      endpoint: this.publicUrl || this.config.get<string>('RUSTFS_ENDPOINT'),
    });
  }

  // Crea el bucket al arrancar si todavía no existe. Reintenta unos segundos
  // por si el servicio de almacenamiento aún está iniciando.
  async onModuleInit(): Promise<void> {
    for (let intento = 1; intento <= 10; intento++) {
      try {
        await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
        return;
      } catch {
        try {
          await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
          this.logger.log(`Bucket "${this.bucket}" creado`);
          return;
        } catch (error) {
          if (intento === 10) {
            this.logger.error(
              `No se pudo crear el bucket "${this.bucket}": ${error}`,
            );
            return;
          }
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'vouchers',
  ): Promise<string> {
    let body: Buffer = file.buffer;
    let contentType = file.mimetype;
    let ext = path.extname(file.originalname);

    if (CONVERTIBLE_IMAGE_TYPES.includes(file.mimetype)) {
      body = await this.imageToPdf(file.buffer);
      contentType = 'application/pdf';
      ext = '.pdf';
    }

    const key = `${folder}/${uuid()}${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    return key;
    // return `${this.publicUrl}/${this.bucket}/${key}`;
  }

  private async imageToPdf(input: Buffer): Promise<Buffer> {
    const jpeg = await sharp(input)
      .rotate() // respeta la orientación EXIF antes de aplanar
      .flatten({ background: '#ffffff' }) // png/webp con transparencia -> fondo blanco
      .jpeg({ quality: 80 })
      .toBuffer();

    const { width, height } = await sharp(jpeg).metadata();
    if (!width || !height) {
      throw new Error('No se pudo leer las dimensiones de la imagen');
    }

    const pdfDoc = await PDFDocument.create();
    const [pageWidth, pageHeight] = PageSizes.A4;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const image = await pdfDoc.embedJpg(jpeg);

    const maxWidth = pageWidth - PAGE_MARGIN * 2;
    const maxHeight = pageHeight - PAGE_MARGIN * 2;
    const scale = Math.min(maxWidth / width, maxHeight / height, 1);
    const drawWidth = width * scale;
    const drawHeight = height * scale;

    page.drawImage(image, {
      x: (pageWidth - drawWidth) / 2,
      y: (pageHeight - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    });

    return Buffer.from(await pdfDoc.save());
  }

  // En el método:
  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return generatePresignedUrl(this.presigner, command, { expiresIn });
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
