const express = require("express");
const axios = require("axios");
require("dotenv").config();

const PlayFab = require("playfab-sdk");

const app = express();

const PORT = process.env.PORT || 3000;


// PlayFab setup
PlayFab.settings.titleId = process.env.PLAYFAB_TITLE_ID;
PlayFab.settings.developerSecretKey = process.env.PLAYFAB_SECRET_KEY;


// Home
app.get("/", (req, res) => {
    res.send("VR Discord PlayFab Backend Online");
});


// Discord callback
app.get("/callback", async (req, res) => {

    const code = req.query.code;
    const playFabId = req.query.state;


    if (!code) {
        return res.status(400).send("Missing Discord code");
    }

    if (!playFabId) {
        return res.status(400).send("Missing PlayFab ID");
    }


    try {

        // Get Discord token
        const tokenResponse = await axios.post(
            "https://discord.com/api/oauth2/token",
            new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID,
                client_secret: process.env.DISCORD_CLIENT_SECRET,
                grant_type: "authorization_code",
                code: code,
                redirect_uri: process.env.REDIRECT_URI
            }),
            {
                headers: {
                    "Content-Type":
                    "application/x-www-form-urlencoded"
                }
            }
        );


        const accessToken =
            tokenResponse.data.access_token;



        // Get Discord user
        const userResponse = await axios.get(
            "https://discord.com/api/users/@me",
            {
                headers: {
                    Authorization:
                    `Bearer ${accessToken}`
                }
            }
        );


        const discordId =
            userResponse.data.id;


        console.log(
            "Discord:",
            discordId,
            "PlayFab:",
            playFabId
        );



        // Give Legacy Catalog item/bundle
        const grantRequest = {

            PlayFabId: playFabId,

            ItemIds:
            [
                "EVERYTHING NO ADMIN"
            ],

            CatalogVersion: "main"
        };



        PlayFab.Server.GrantItemsToUser(
            grantRequest,

            function(error, result) {

                if (error) {

                    console.log(
                        "PlayFab Error:",
                        error
                    );

                    return res.status(500)
                    .send(
                        "Discord linked but reward failed"
                    );
                }


                console.log(
                    "Bundle granted!"
                );


                res.send(
                    "Discord linked! EVERYTHING NO ADMIN granted!"
                );
            }
        );


    } catch(error) {

        console.log(
            error.response?.data || error
        );

        res.status(500)
        .send(
            "Discord login failed"
        );

    }

});



app.listen(PORT, () => {

    console.log(
        "Server running on port " + PORT
    );

});
