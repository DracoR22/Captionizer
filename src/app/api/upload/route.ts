import { NextResponse } from "next/server"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import uniqid from 'uniqid'

export async function POST(req: Request) {
    const formData = await req.formData() 

    const file = formData.get('file')
  
        //@ts-ignore
        const { name, type } = file;
        //@ts-ignore
        const data = await file.arrayBuffer()
    
        const s3Client = new S3Client({
            region: 'us-east-2',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
            }
        })

        const id = uniqid()
        const ext = name.split('.').slice(-1)[0]
        const newName = id + '.' + ext

        const uploadCommand = new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            //@ts-ignore
            Body: data,
            ACL: 'public-read',
            ContentType: type,
            Key: newName
        })

        await s3Client.send(uploadCommand)

    return NextResponse.json({name, ext, newName, id})
}