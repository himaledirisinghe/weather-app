var router = require('express').Router();
const { requiresAuth } = require('express-openid-connect');
const fetch = require('node-fetch');//
require('dotenv').config()//
const fs = require("fs");////

router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Auth0 Webapp sample Nodejs',
    isAuthenticated: req.oidc.isAuthenticated()
  });
});

router.get('/profile', requiresAuth(), function (req, res, next) {
  res.render('profile', {
    userProfile: JSON.stringify(req.oidc.user, null, 2),
    title: 'Profile page'
  });
});

router.get('/weather', requiresAuth(), (req, res) => {
  let cache = {
    data: null,
    timeCached: null
  };
  // Check if there is valid cached data
  if (cache.data && Date.now() - cache.timeCached < 5 * 60 * 1000) {
    // Serve cached data
    res.render('weather', cache.data);
  } else {
    // Make a new request to the OpenWeatherMap API
    const url_api = `https://api.openweathermap.org/data/2.5/weather?q=kalutara&appid=aeb0624cb34db86f256b07915d6c664b`;
    fs.readFile("cities.json", "utf8", async (err, jsonString) => {
      if (err) {
        return ("Error reading file from disk:", err);
      }
      try {
        let cityArr = [];
        const cities = JSON.parse(jsonString);
        for (let index = 0; index < cities.List.length; index++) {
          cityArr.push(cities.List[index].CityCode);
        }
        cityArr = cityArr.toString();
        const url = 'https://api.openweathermap.org/data/2.5/group?id=' + cityArr + '&units=metric&appid=aeb0624cb34db86f256b07915d6c664b';
        await fetch(url)
          .then(res => res.json())
          .then(data => {
            const id = [];
            const city = [];
            const des = [];
            const icon = [];
            const temp = [];

            for (let i = 0; i < data.list.length; i++) {
              id.push(data.list[i].id);
              city.push(data.list[i].name);
              des.push(data.list[i].weather[0].description);
              icon.push(data.list[i].weather[0].icon);
              temp.push(data.list[i].main.temp);
            }
            // Update cache with new data and current time
            cache.data = {city, des, icon,temp,id};
            cache.timeCached=Date.now();

            res.render('weather', {city, des, icon,temp,id});
          });
      } catch (err) {
        return ("Error parsing JSON string:", err);
      }
    });
  }
});

  


module.exports = router;
