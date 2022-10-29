const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const webAppUrl = 'https://wondrous-kringle-9f09c8.netlify.app';
const token ='5697101769:AAERzghMSQzdXT_KvshyMea0I3R7cEIKd8I'; 

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());


bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text === '/start') {
        await bot.sendMessage(chatId, 'Заполните форму выбрав кнопку "каталог" в клавиатуре', {
            reply_markup: {
                keyboard: [
                    [{text: 'Каталог', web_app: {url: webAppUrl + '/form'}}]
                ]
            }
        })


        await bot.sendMessage(chatId, 'Наш сайт доступен по ссылке ниже', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Сайт', web_app: {url: webAppUrl}}]
                ]
            }
        })
    }

    if(msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data)

            await bot.sendMessage(chatId, 'Данные которые вы ввели представлены ниже')
            await bot.sendMessage(chatId, 'Страна: ' + data?.country);
            await bot.sendMessage(chatId, 'Улица: ' + data?.street);

            setTimeout( async () => {
                await bot.sendMessage(chatId, 'Вся информация представлена в этом чате');
            }, 1000)
        } catch (e) {
            console.log(e);
        }
    }
});

app.post('/web-data', async (req, res) => {
    const {queryId, products, totalPrice} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
            }
        })
        return res.status(200).json({});    
    } catch (e) {
        return res.status(500).json({});  
    }
})


const PORT = 8000;


app.listen(PORT, () => console.log('Server started on PORT ' + PORT))
