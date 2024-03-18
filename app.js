const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const url =
  "https://listverse.com/2024/03/14/ten-strange-but-true-geography-facts/";

const getHTML = async () => {
  const { data: html } = await axios.get(url);
  return html;
};

getHTML().then((res) => {
  const $ = cheerio.load(res);

  const p = $("#articlecontentonly").find("p");
  let description = [];
  for (let i = 0; i < p.length; i++) {
    if ($(p[i]).attr("class") === "promote_see_also") {
      break;
    }
    description.push($(p[i]).text());
  }

  let contentHTML = `
    <h1>${$("h1").text()}</h1>
    ${description.map((e) => `<p>${e}</p>`).join("")}`;

  $("#articlecontentonly")
    .find("h2")
    .each(function () {
      // get title
      const heading = $(this).text();
      contentHTML += `<h2>${heading}</h2>`;

      // get link video
      const linkVideo = $(this)
        .nextUntil("h2", "div")
        .find('meta[itemprop="embedURL"]')
        .attr("content");
      contentHTML += `<iframe src="${linkVideo}"></iframe>`;

      // get content
      $(this)
        .nextUntil("h2", "p")
        .each(function () {
          // Remove tag sup in link
          const supLink = $(this).find("sup");
          supLink.replaceWith(supLink.text());

          // Remove p tag that contains br tag
          if ($(this).has("br").length > 0) {
            $(this).remove();
          } else {
            contentHTML += `${$(this).prop("outerHTML")}`;
          }
        });
    });

  // convert content to HTML
  const output = cheerio.load(contentHTML).html();
  // Write output to file
  fs.writeFileSync("output.html", output);
});
