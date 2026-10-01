import { CATEGORIES } from "./data";
import type { LegalCategoryId } from "./types";


export interface ClassificationResult {

  categoryId: LegalCategoryId;

  confidence:number;

  rationale:string;

  scores:{
    categoryId:LegalCategoryId;
    score:number;
    matches:string[];
  }[];

}



export function classifyCase(
 text:string
):ClassificationResult{


const normalized=text
.toLowerCase()
.normalize("NFD")
.replace(/\p{Diacritic}/gu,"");



const scores=CATEGORIES.map(category=>{


let score=0;

const matches:string[]=[];



for(const keyword of category.keywords){


const cleanKeyword=keyword
.toLowerCase()
.normalize("NFD")
.replace(/\p{Diacritic}/gu);



if(normalized.includes(cleanKeyword)){


matches.push(keyword);


// palabras más importantes pesan más

if(
[
"custodia",
"divorcio",
"violencia",
"despido",
"contrato",
"delito",
"robo"
].includes(keyword)
){

score+=3;

}else{

score+=1;

}


}


}



return {

categoryId:category.id,

score,

matches

};


})
.sort((a,b)=>b.score-a.score);



const best=scores[0];

const second=scores[1];



let confidence=0;



if(best.score>0){

confidence=Math.min(
0.95,
0.5+
(best.score-second.score)*0.15
);


}



return {


categoryId:
best.score>0
?best.categoryId
:"revision",


confidence,


rationale:
best.score>0
?
`Detectado por: ${best.matches.join(", ")}`
:
"No se encontraron indicadores claros.",


scores


};


}