export async function classifyWithAI(
description:string
){


const response = await fetch(
"/api/classify",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
description
})

}

);


return await response.json();


}