import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prismaClient } from "@/app/lib/db";
const YT_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com\/(?:watch\?(?!.*\blist=)(?:.*&)?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&]\S+)?$/;

//@ts-ignore
import youtubesearchapi from "youtube-search-api"


const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string(),
});

export async function POST(req: NextRequest) {
    try {
        const data = CreateStreamSchema.parse(await req.json());
        const isYt = data.url.match(YT_REGEX);
        if (!isYt) {
            return NextResponse.json({
                message: "Wrong url Format"
            }, { status: 400 })
        }

        const extractedId = isYt[1];

      const res = await youtubesearchapi.GetVideoDetails(extractedId);
     
      const thumbnails = res.thumbnail.thumbnails;
      thumbnails.sort((a: {width: number}, b: {width: number}) => a.width < b.width ? -1 : 1);


      const stream =  await prismaClient.stream.create({
            data: {
                userId: data.creatorId,
                url: data.url,
                extractedId,
                type: "Youtube",
                title: res.title ?? "Can't find video",
                smallImg: (thumbnails.length > 1 ? thumbnails[thumbnails.length - 2].url: thumbnails[thumbnails.length - 1].url) ?? "https://media.istockphoto.com/id/1426692001/vector/cute-funny-halloween-ghost-scary-design-illustration-childish-spooky-boo-character-for-kids.jpg?s=612x612&w=0&k=20&c=y08yBlCL0efHrKQrXqA78ql0_LAcb5_0y92IHLxpYKU=",
                bigImg: thumbnails[thumbnails.length -1].url ?? "https://media.istockphoto.com/id/1426692001/vector/cute-funny-halloween-ghost-scary-design-illustration-childish-spooky-boo-character-for-kids.jpg?s=612x612&w=0&k=20&c=y08yBlCL0efHrKQrXqA78ql0_LAcb5_0y92IHLxpYKU="
                
            }
        }); 
        
        return NextResponse.json({
            message: "Added stream",
            id: stream.id
        })
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Unknown error";
        return NextResponse.json(
            { message: `Error while adding a stream: ${errorMessage}` },
            { status: 500 }
        );
    }


}


export async function GET(req: NextRequest) {
    const creatorId = req.nextUrl.searchParams.get("creatorId");
    const streams = await prismaClient.stream.findMany({
        where: {
            userId: creatorId ?? ""
        }
    })

    return NextResponse.json({
        streams
    })
}