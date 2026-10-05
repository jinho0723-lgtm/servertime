const fs = require('fs');

const html = fs.readFileSync('scripts/yes24_noticemain.html', 'utf8');

// Look for notice links with #id=
const regex = /href=['"]([^'"]*Notice[^'"]*#id=(\d+)[^'"]*)['"]/gi;
let m;
const links = [];
while ((m = regex.exec(html)) !== null) {
  links.push({ url: m[1], id: m[2] });
}
console.log('Total notice links in NoticeMain:', links.length);
console.log(links.slice(0, 10));

// Also check for category tabs or sections in yes24 NoticeMain
const cats = html.match(/class=['"][^'"]*category[^'"]*['"]|onclick=['"][^'"]*category[^'"]*['"]/gi) || [];
console.log('Category matches:', cats);
