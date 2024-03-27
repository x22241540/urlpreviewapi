var express = require("express");
var router = express.Router();
const pool = require("../public/javascripts/database/database.js");
const validator = require("validator");
const crypto = require("crypto");
const async = require("async"); // Importing async for queue based processing
const axios = require("axios");
const cheerio = require("cheerio");

const concurrency = 4;

// Task function for the queue
const processPreviewLinkTask = (task, done) => {
  console.log("inside task");
  const { URL, header: xClientApp = false, user} = task;
  console.log(user);
  if (xClientApp) {
    console.log('inside client url check')
    pool.query("SELECT * FROM URLPreview.links WHERE link = ? and user = ? and category = ?", [URL, user.user, user.category])
      .then(([results]) => {
        console.log("checking if url exists");
        if (results.length > 0) {
          // If link already exists, return the preview content
          done(null, { link: URL, previewContent: results[0] });
        } else {
          console.log("no url with user");
          // Fetch new URL content and save to DB
          fetchurlcontent(URL, true, user, done);
        }
      })
      .catch((error) => {
        done(error);
      });
  } else {
    // Just fetch URL content without saving
    fetchurlcontent(URL, false, null, done);
  }
};

function fetchurlcontent(URL, saveToDb, user, done) {
  console.log(user);
  console.log("Fetching new URL content with axios");
  axios.get(URL).then(({ data }) => {
    const $ = cheerio.load(data);
    const linktitle = $("title").first().text();
    const linkdescription = $('meta[name="description"]').attr("content");
    const linkimage = $('meta[property="og:image"]').attr("content") || $('link[rel="icon"]').attr("href");
    const preview = { linktitle, linkdescription, linkimage, link: URL };
    if (saveToDb) {
      console.log('inside saving to db');
      // Insert into DB then call done
      const insertQuery = "INSERT INTO URLPreview.links (user, category, link, linkimage, linktitle, linkdescription) VALUES (?, ?, ?, ?, ?, ?)";
      pool.query(insertQuery, [user.user, user.category, URL, linkimage, linktitle, linkdescription, ]).then(() => {
          console.log('saved to db');
          done(null, { link: URL, previewContent: preview }); // Pass the preview data to the done callback after saving
        })
        .catch((error) => {
          console.log('cant save to db')
          done(error);
        });
    } else {
      done(null, { link: URL, previewContent: preview });
    }
  }).catch((error) => {
    done(error);
  });
}

// initializing the queue by passing in the taskfunction and the concurrency
const previewlinkQueue = async.queue(processPreviewLinkTask, concurrency);
// Define what happens when a task is completed
previewlinkQueue.drain(() => {
  console.log("All link preview tasks have been processed");
});

router.post("/", function (req, res, next) {
  const {url, ...user} = req.body;
  const xClientApp  = req.get('X-Client-App');
  console.log(url +" "+xClientApp );

  if (!validator.isURL(url)) {
    return res.status(400).json({ error: "Invalid URL" });
  }
  // Adding the received url to the queue object
  previewlinkQueue.push({ URL: url, header: xClientApp, user}, (err, result) => {
    if (err) {
      // Handle errors that occurred during the task processing
      return res.status(500).json({ error: "Internal Server Error" });
    }
    // Send the response back to the client
    console.log(result);
    res.json(result);
  });
});

module.exports = router;
