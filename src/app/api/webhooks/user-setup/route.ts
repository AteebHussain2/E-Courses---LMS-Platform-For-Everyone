import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    const body = await request.json()
    const data = body.data
    // console.log(data)
    try {
        console.log(body.type)
        switch (body.type) {
            case "user.created":
                console.log("CREATING USER")

                await prisma.user.create({
                    data: {
                        userId: data.id,
                        firstName: data.first_name,
                        lastName: data.last_name,
                        avatar: data.profile_image_url,

                        username: data.first_name,
                        email: data.email_addresses[0]?.email_address || '',
                    },
                });

                console.log("CREATED USER")

                return NextResponse.json('User Successfully Created', { status: 200 });

            case 'user.updated':
                await prisma.user.update({
                    where: {
                        userId: data.id
                    },
                    data: {
                        username: data.username,
                        firstName: data.first_name,
                        lastName: data.last_name,
                        avatar: data.profile_image_url,

                        email: data.email_addresses[0].email_address,
                    },
                });
                return NextResponse.json('User Successfully Updated', { status: 200 });

            case 'user.deleted':
                await prisma.user.delete({
                    where: {
                        userId: data.id
                    },
                });
                return NextResponse.json('User Successfully Deleted', { status: 200 });
        };
    } catch (error) {
        console.error(error)
        return NextResponse.json('Failed to create user' + error, { status: 500 });
    };

    console.log("CREATED USER")
    return NextResponse.json({ message: "Success", status: 200 });
};