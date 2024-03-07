import AWS from "aws-sdk";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { config } from "#root/config/awsConfig.js";
import dataSource from "#root/config/ormConfig.js";
import StreamEntity from "#root/entity/Stream.js";

const streamRepo = dataSource.getRepository(StreamEntity);

const s3 = new AWS.S3({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: process.env.AWS_REGION,
    useAccelerateEndpoint: true,
});

const IVS = new AWS.IVS({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: process.env.AWS_REGION,
});

const IVSChat = new AWS.Ivschat({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: process.env.AWS_REGION,
});

/*
    This is sample channel detail info given after creating channel using aws-sdk.
    The Streamer use 2 values for broadcasting live streaming:
        channel.ingestEndpoint
        streamKey.value
    The following value is used to delete channel using aws-sdk:
        streamKey.channelArn
*/
// {
//     channel: {
//       arn: 'arn:aws:ivs:us-east-1:634253800984:channel/nadn7x6hUTNd',
//       authorized: false,
//       ingestEndpoint: '84d0a599413f.global-contribute.live-video.net',
//       insecureIngest: false,
//       latencyMode: 'LOW',
//       name: 'demo-with-code',
//       playbackUrl: 'https://84d0a599413f.us-east-1.playback.live-video.net/api/video/v1/us-east-1.634253800984.channel.nadn7x6hUTNd.m3u8',
//       preset: '',
//       recordingConfigurationArn: '',
//       tags: {},
//       type: 'STANDARD'
//     },
//     streamKey: {
//       arn: 'arn:aws:ivs:us-east-1:634253800984:stream-key/1GLcPWs8X2lV',
//       channelArn: 'arn:aws:ivs:us-east-1:634253800984:channel/nadn7x6hUTNd',
//       tags: {},
//       value: 'sk_us-east-1_1GLcPWs8X2lV_9bgLB7BygYldoQS7bf1TXIjkt7L30g'
//     }
//  }

/*
    create live streaming channel function
    params:
        name - channel name
*/
const createStreamChannel = async (name) => {
    try {
        let params = {
            authorized: false,
            insecureIngest: false,
            latencyMode: "LOW",
            name: name,
            preset: "",
            recordingConfigurationArn: "",
            type: "STANDARD"
        };
        return await IVS.createChannel(params).promise();
    } catch (e) {
        console.error("error while creating channel: ", e);
        throw new Error("Faild to create stream channel.");
    }
}

/* 
    delete live streaming channel function
    params:
    channelArn - channelArn of channel
*/
const deleteStreamChannel = async (channelArn) => {
    try {
        let params ={
            arn: channelArn
        }
        return await IVS.deleteChannel(params).promise();
    } catch (e) {
        console.log("Error while deleting stream channel: ", e);
        throw new Error("Failed to delete stream channel.");
    }
}

/*
    Chatroom detail info sample
*/
// {
//     arn: 'arn:aws:ivschat:us-east-1:634253800984:room/1L20HzI5GcuZ',
//     createTime: 2024-02-11T23:01:25.058Z,
//     id: '1L20HzI5GcuZ',
//     maximumMessageLength: 500,
//     maximumMessageRatePerSecond: 10,
//     name: 'demo-with-code',
//     tags: {},
//     updateTime: 2024-02-11T23:01:25.058Z
// }

/* 
    create chatroom function
    params:
        name - name of chatroom
*/
const createChatRoom = async (name) => {
    try {
        let params = {
            name: name,
        };
        return await IVSChat.createRoom(params).promise();
    } catch (e) {
        console.log("Error while creating chat room: ", e);
        throw new Error("Failed to create chat room.");
    }
}

/* 
    delete chatroom fuction
    params:
        roomArn - arn of chat room
*/
const deleteChatRoom = async(roomArn) => {
    try {
        let params = {
            identifier: roomArn,
        };
        return await IVSChat.deleteRoom(params).promise();
    } catch (e) {
        console.log("Error while deleting chat room: ", e);
        throw new Error("Failed to deleting chat room.");
    }
}

/*
    chat token detail sample
*/
// {
//     sessionExpirationTime: 2024-02-12T02:20:08.000Z,
//     token: 'AQICAHg6NcEa06cJt8_5UnjipPWDfjCw2WJK_t_EJOvwB1RH3wHSNemT_8q6q0DH27fLf3KpAAAB1TCCAdEGCSqGSIb3DQEHBqCCAcIwggG-AgEAMIIBtwYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAzjglkzsdOWz7SW15ECARCAggGIsI-YVqC4dyipiwbI69OMYXJSB-ltSsToFdz3hXbnfDt9T5j9X9M9armsd9zhixtej62NqoF0A9Yh0xy_ayA3DXUSkiHJ_IpZwxH07ww2PUzZSJH-CW6pd4Im3DjjDysCOcatVeDlh1UIVLhc706u-3-EssbF5q5zP1UqZqS21JxSv7TD3uta8c-EC5-VOYES5gOG0omRLOdFp2w8gpyKgB6zTLrTAkqmjTKhZ7rmZDw1P5INTbd0Z0NiAxCjZn8y4Cnif2hvL7NmPH68NlLA5KE-1RcDmS8ubWHHA-xG_CNY5HbiwJA111crRNrNP6xi0nai3ClSG0-CPtPc_h5Iyy_ST4mQs5KD03lEJGguTLUFlOR7D6Z3OYS6q_rf7v7yAR6cwO6sebOexQOti_C8-9LRVQW2HZsz0i0sZ2M5OCXuPIPo7j4_z5SiKni_wXeB5XBRhC6BGQuWVWmuPZAXILN8I2VZ2KJ86PYueXjQo6gOKGyOW8k3IUECsL7MyWdvwEme94yYWV0!#1',
//     tokenExpirationTime: 2024-02-12T00:20:08.000Z
// }

/* 
    create chat token of chat room
    paras:
        roomArn - arn of chat room
        username - user identifier, we can use username
*/
const createChatToken = async (roomArn, userId, attributes) => {
    try {
        const params = {
            roomIdentifier: roomArn, 
            userId: userId,
            attributes: { ...attributes },
            capabilities: [
                "SEND_MESSAGE"
            ],
            sessionDurationInMinutes: 180
        }
        return await IVSChat.createChatToken(params).promise();
    } catch (e) {
        console.log("Error while creating chat token: ", e);
        throw new Error("Failed to create chat token.");
    }
}

export const createStream = async (req, res, next) => {
    try {
        const { title, type, market, description } = req.body;
        const user = req.user;
        const path = req.file?.path ?? null;

        let file = null;
        if(path) {
            const fileContent = fs.readFileSync(path);
            const params = {
                Bucket: process.env.AWS_BUCKET,
                Key: `stream_cover/${uuidv4()}_${fileContent.originalname}`,
                Body: fileContent,
                ACL: "public-read",
            };
            file = await s3.upload(params).promise();
            fs.unlinkSync(path);
        }
        
        
        // generate random & unique channel name
        let id;

        while (1) {
            id = uuidv4();
            const tmp = await streamRepo.findOne({
                where: {
                    id: id, 
                }
            });
            if(!tmp) break;
        }

        const channelData = await createStreamChannel(id);
        const chatRoom = await createChatRoom(id);

        const stream = {
            id,
            cover_url: file ? decodeURIComponent(file.Location): null,
            cover_s3_key: file? file.key : null,
            title,
            type,
            market,
            description,
            streamkey_value: channelData.streamKey.value,
            streamkey_arn: channelData.streamKey.channelArn,
            ingest_endpoint: channelData.channel.ingestEndpoint,
            playback_url: channelData.channel.playbackUrl,
            chatroom_arn: chatRoom.arn,
            user
        }

        const streamRecord = await streamRepo.save(stream);

        res.json(streamRecord);
    } catch (error) {
        next(error);
    }
}

export const getStreamData = async (req, res, next) => {
    try {
        const { id } = req.params || {} ;
        const stream = await streamRepo.findOne({
            where: {
                id: id, 
            },
            relations: {
                user: true
            }
        });

        if(!stream) {
            return res.status(400).json({ msg: "Stream does not exist." });
        }
        res.json(stream);
    } catch (error) {
        res.status(500).json({error: error});
        // next(error);
    }
}

export const deleteStream = async (req, res, next) => {
    try {
        const { id } = req.params || {};
        const user = req.user;
        const stream = await streamRepo.findOne({
            where: {
                id: id, 
            },
            relations: {
                user: true
            }
        });

        if(!stream) {
            return res.status(400).json({msg: "Stream does not exist."});
        }

        if(stream?.user?.id != user?.id) {
            return res.status(403).json({ msg: "Stream is not your own." });
        }

        await deleteStreamChannel(stream.streamkey_arn);
        await deleteChatRoom(stream.chatroom_arn);
        if(stream.cover_s3_key) {
            let params = {
                Bucket: process.env.AWS_BUCKET,
                Key: stream.cover_s3_key,
            };
            await s3.deleteObject(params).promise();
        }

        await streamRepo.delete({id: stream.id});

        res.json({status: "success"});
    } catch (error) {
        return res.status(500).json({error: error});
        next(error);
    }
}

export const getChatToken = async (req, res, next) => {
    try {
        const { arn, userId, attributes } = req.body;
        console.log(arn);
        console.log(userId);
        console.log(attributes);
        const result = await createChatToken(arn, userId, attributes);
        console.log(result);
        res.json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: error})
    }
}