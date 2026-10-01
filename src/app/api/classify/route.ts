import { NextResponse } from "next/server";


export async function POST(
request:Request
){


const {description}=await request.json();



/*
Aquí llamaría la IA
*/


return NextResponse.json({

category:"familia",

confidence:0.92,

reason:
"El caso menciona custodia y relación familiar"


});


}
