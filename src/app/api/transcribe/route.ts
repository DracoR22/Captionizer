import { NextResponse } from "next/server"
import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {GetTranscriptionJobCommand, StartTranscriptionJobCommand, TranscribeClient} from "@aws-sdk/client-transcribe";

function getClient() {
    return new TranscribeClient({
        region: 'us-east-2',
            credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY!,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
        }
    })
}

function createTranscriptionCommand(filename: string) {
   return new StartTranscriptionJobCommand({
        TranscriptionJobName: filename,
        OutputBucketName: process.env.BUCKET_NAME,
        OutputKey: `${filename}.transcription`,
        IdentifyLanguage: true,
        Media: {
            MediaFileUri: `s3://${process.env.BUCKET_NAME}/${filename}`
        }
    })
}

async function createTranscriptionJob(filename: string) {
    const transcribeClient = getClient()

    const transcriptionCommand = createTranscriptionCommand(filename)
    return transcribeClient.send(transcriptionCommand)
}

async function getJob(filename: string) {
    const transcribeClient = getClient()

    let jobStatusResult = null

    try {
        const transcriptionJobStatusCommand = new GetTranscriptionJobCommand({
            TranscriptionJobName: filename
        })
    
        jobStatusResult = await transcribeClient.send(transcriptionJobStatusCommand)
    } catch (error) {
        
    }
    return jobStatusResult
}

async function streamToString(stream: any) {
    const chunks: any = [];
    return new Promise((resolve, reject) => {
      stream.on('data',(chunk: any) => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      stream.on('error', reject);
    });
  }

async function getTranscriptionFile(filename: string) {
    const transcriptionFile = filename + '.transcription';
    const s3client = new S3Client({
      region: 'us-east-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: transcriptionFile,
    });
    let transcriptionFileResponse = null;
    try {
      transcriptionFileResponse = await s3client.send(getObjectCommand);
    } catch (e) {}
    if (transcriptionFileResponse) {
      return JSON.parse(
        await streamToString(transcriptionFileResponse.Body) as any
      );
    }
    return null;
  }
  

export async function GET(req: Request) {
    const url = new URL(req.url)

    const searchParams = new URLSearchParams(url.searchParams)
    const filename = searchParams.get('filename')

    if (!filename) {
        return new NextResponse('File not found', { status: 400 })
    }

    // Find ready transcription
    const transcription = await getTranscriptionFile(filename);
    if (transcription) {
      return NextResponse.json({ status:'COMPLETED', transcription });
    }

    // Check if already transcribing
    const existingJob: any = await getJob(filename)

    if (existingJob) {
        return NextResponse.json({ status: existingJob.TranscriptionJob.TranscriptionJobStatus })
    }
    
    if (!existingJob) {
       const newJob = await createTranscriptionJob(filename)
       return NextResponse.json({ status: newJob.TranscriptionJob?.TranscriptionJobStatus })
    }

    return NextResponse.json(null)
}