const express = require('express');
const app = express();
const cron = require('node-cron');
const { Expo } = require('expo-server-sdk')
const expo = new Expo()
const axios = require('axios');

const sendPushNotification = async () => {
    let somePushTokens=[]
    const messages = []
    axios.get('https://dataplussales.pythonanywhere.com/api/v1/auth/gettotalmerchandisers/')
  .then(response => {
      let merchandisers=response.data.logged_in_merchandisers
    for(var i=0; i<merchandisers.length;i++){
        var id_token=merchandisers[i]['id_token']
        somePushTokens.push(id_token)
    }

    for (let pushToken of somePushTokens) {
        if (!Expo.isExpoPushToken(pushToken)) {
          console.error(`Push token ${pushToken} is not a valid Expo push token`);
          continue;
        }
        messages.push({
          to: pushToken,
          sound: 'default',
          title: 'Fan milk notification',
          body: 'Please do your planogram as it is time to do it!',
          data: { 'shopid': 51 },
        })
      }
    
   

    const chunks = expo.chunkPushNotifications(messages)
    const tickets = []
  
    try {
      ;(async () => {
        for (const chunk of chunks) {
          try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
            tickets.push(...ticketChunk)
          } catch (error) {
            console.error(error)
          }
        }
      })()
    } catch (error) {
      console.error(error)
    } 
   
  })
  .catch(error => {
    console.log(error);
  });

 

   
    
  }

  cron.schedule('00 30 13 * * 0-5', sendPushNotification);





app.listen(2400, () => {console.log("Server started at port 2400")});