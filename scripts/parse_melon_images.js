const fs = require('fs');

const csoonHtml = fs.readFileSync('scripts/melon_csoon.html', 'utf8');

// The csoon list has:
// <div class="first cont">
//   <a href="./detail.htm?csoonId=12964" class="thumb_160x225">
//     <span class="img"><img ... src="https://cdnticket.melon.co.kr/resource/image/upload/ticketopen/2026/09/2026093018030798912cdc-f2ba-4795-a1a1-61edca695055.jpg/melon/resize/160x225/strip/true" alt="" /></span>

// Notice the image is right inside the <a href="./detail.htm?csoonId=..."> link or nearby!
// Let's match all <li> blocks in .box_ticket_list
const listMatch = csoonHtml.match(/<ul class="list_ticket">([\s\S]*?)<\/ul>/) || csoonHtml.match(/<ul[^>]*>([\s\S]*?)<\/ul>/g);

// Let's find every csoonId and its image in csoonHtml
const idImgMap = {};
const itemRegex = /href="\.\/detail\.htm\?csoonId=(\d+)"[\s\S]*?<img[^>]+src="([^"]+)"/g;
let m;
while ((m = itemRegex.exec(csoonHtml)) !== null) {
  let img = m[2];
  if (img.includes('/melon/resize/')) img = img.split('/melon/resize/')[0];
  idImgMap[m[1]] = img;
}

// Or img before href
const itemRegex2 = /<img[^>]+src="([^"]+)"[\s\S]*?href="\.\/detail\.htm\?csoonId=(\d+)"/g;
while ((m = itemRegex2.exec(csoonHtml)) !== null) {
  let img = m[1];
  if (img.includes('/melon/resize/')) img = img.split('/melon/resize/')[0];
  if (!idImgMap[m[2]]) idImgMap[m[2]] = img;
}

console.log('idImgMap:', idImgMap);
