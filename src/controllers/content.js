import AWS from "aws-sdk";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { config } from "#root/config/awsConfig.js";
import dataSource from "#root/config/ormConfig.js";
import VideoEntity from "#root/entity/Video.js";
import ContentEntity from "#root/entity/Content.js";
import SubscriptionEntity from "#root/entity/Subscription.js";
import { PROFILE } from "#root/entity/Subscription.js";

const s3 = new AWS.S3({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
  region: process.env.AWS_REGION,
  useAccelerateEndpoint: true,
});

const videoRepo = dataSource.getRepository(VideoEntity);
const contentRepo = dataSource.getRepository(ContentEntity);
const subscriptionRepo = dataSource.getRepository(SubscriptionEntity);

export const initiateUpload = async (req, res, next) => {
  try {
    const { fileName } = req.body;

    const uuid = uuidv4();

    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: `videos/${uuid}_${fileName}`,
    };
    const upload = await s3.createMultipartUpload(params).promise();
    res.json({ uploadId: upload.UploadId, tempId: uuid });
  } catch (error) {
    next(error);
  }
};

export const uploadFile = async (req, res, next) => {
  const { index, fileName, tempId, uploadId, file } = req.body;

  const myBuffer = Buffer.from(file, "base64");

  const s3Params = {
    Bucket: process.env.AWS_BUCKET,
    Key: `videos/${tempId}_${fileName}`,
    Body: myBuffer,
    PartNumber: Number(index) + 1,
    UploadId: uploadId,
  };

  s3.uploadPart(s3Params, (err, data) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Error uploading chunk" });
    }

    return res.json({ success: true, message: "Chunk uploaded successfully" });
  });
};

export const completeUpload = async (req, res, next) => {
  const { fileName, uploadId, tempId } = req.body;
  const s3Params = {
    Bucket: process.env.AWS_BUCKET,
    Key: `videos/${tempId}_${fileName}`,
    UploadId: uploadId,
  };

  s3.listParts(s3Params, (err, data) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Error listing parts" });
    }

    const parts = [];
    data.Parts.forEach((part) => {
      parts.push({
        ETag: part.ETag,
        PartNumber: part.PartNumber,
      });
    });

    s3Params.MultipartUpload = {
      Parts: parts,
    };

    s3.completeMultipartUpload(s3Params, (err, data) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ success: false, message: "Error completing upload" });
      }

      return res.json({
        success: true,
        message: "Upload complete",
        data: decodeURIComponent(data.Location),
        key: data.Key,
      });
    });
  });
};

export const addVideo = async (req, res, next) => {
  try {
    const { name, description, video_url, video_s3_key } = req.body;
    const path = req.file.path;

    const fileContent = fs.readFileSync(path);

    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: `posters/${uuidv4()}_${req.file.originalname}`,
      Body: fileContent,
      ACL: "public-read",
    };

    const file = await s3.upload(params).promise();
    fs.unlinkSync(path);

    const video = {
      name,
      description,
      video_url,
      video_s3_key,
      poster_url: decodeURIComponent(file.Location),
      poster_s3_key: file.Key,
      user: req.user,
    };

    const videoRecord = await videoRepo.save(video);
    console.log(videoRecord);

    res.json(videoRecord);
  } catch (error) {
    next(error);
  }
};

export const updateVideo = async (req, res, next) => {
  try {
    const { id } = req.params || {};
    const { name, description } = req.body;
    const file = req.file;

    const video = await videoRepo
      .createQueryBuilder("videos")
      .where("id = :id", { id })
      .getOne();

    if (!video) {
      res.status(400).json({ msg: "Video does not exist." });
    }

    if (file) {
      let params = {
        Bucket: process.env.AWS_BUCKET,
        Key: video.poster_s3_key,
      };
      await s3.deleteObject(params).promise();

      const fileContent = fs.readFileSync(file.path);

      params = {
        Bucket: process.env.AWS_BUCKET,
        Key: `posters/${uuidv4()}_${file.originalname}`,
        Body: fileContent,
        ACL: "public-read",
      };

      const posterRes = await s3.upload(params).promise();
      fs.unlinkSync(file.path);

      video.poster_url = decodeURIComponent(posterRes.Location);
      video.poster_s3_key = posterRes.Key;
    }

    video.name = name;
    video.description = description;
    await videoRepo.save(video);

    res.json(video);
  } catch (error) {
    next(error);
  }
};

export const deleteVideo = async (req, res, next) => {
  try {
    const { id } = req.params || {};

    const video = await videoRepo
      .createQueryBuilder("videos")
      .where("id = :id", { id })
      .getOne();

    if (video) {
      // Delete files from the s3 bucket.
      let params = {
        Bucket: process.env.AWS_BUCKET,
        Key: video.video_s3_key,
      };
      await s3.deleteObject(params).promise();

      params = {
        Bucket: process.env.AWS_BUCKET,
        Key: video.poster_s3_key,
      };
      await s3.deleteObject(params).promise();
    }

    await videoRepo
      .createQueryBuilder("videos")
      .where("id = :id", { id })
      .delete()
      .execute();

    res.json({});
  } catch (error) {
    next(error);
  }
};

export const uploadContent = async (req, res, next) => {
  try {
    const { type, market, title, description, content_type, files } = req.body;

    const videoFiles = [];
    for (let i = 0; i < files.length; i++) {
      const videoFile = await videoRepo.findOneById(files[i]);
      if (videoFile) {
        videoFiles.push(videoFile);
      }
    }

    const content = {
      type,
      market,
      title,
      description,
      content_type,
      files: videoFiles,
      user: req.user,
    };
    await contentRepo.save(content);
    res.json({});
  } catch (error) {
    next(error);
  }
};

export const updateContent = async (req, res, next) => {
  try {
    const { id } = req.params || {};
    const { name, description } = req.body;

    const content = await contentRepo.findOne({
      where: {
        id: id,
      },
      relations: {
        files: true,
        user: true,
      },
    });

    if (!content) {
      return res.status(400).json({ msg: "Content does not exist." });
    }

    if (content?.user?.id !== req.user.id) {
      return res.status(400).json({ msg: "Permission denied." });
    }

    if (content.type === "playlist") {
      content.title = name;
      content.description = description;
      await contentRepo.save(content);
    } else {
      const videoFile = content.files?.[0];
      if (!videoFile) {
        res.status(400).json({ msg: "Video does not exist." });
        return;
      }

      videoFile.name = name;
      videoFile.description = description;
      await videoRepo.save(videoFile);
    }

    res.json({});
  } catch (error) {
    next(error);
  }
};

export const deleteContent = async (req, res, next) => {
  try {
    const { id } = req.params || {};
    const content = await contentRepo.findOne({
      where: {
        id: id,
      },
      relations: {
        files: true,
        user: true,
      },
    });

    if (!content) {
      return res.status(400).json({ msg: "Content does not exist." });
    }

    if (content?.user?.id !== req.user.id) {
      return res.status(400).json({ msg: "Permission denied." });
    }

    for (let i = 0; i < content.files.length; i++) {
      const video = content.files[i];

      const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: video.poster_s3_key,
      };
      await s3.deleteObject(params).promise();
      params.Key = video.video_s3_key;
      await s3.deleteObject(params).promise();

      await videoRepo.delete({ id: video.id });
    }

    await contentRepo.delete({ id: content.id });

    res.json({});
  } catch (error) {
    next(error);
  }
};

export const getVideos = async (req, res, next) => {
  try {
    const { userId } = req.query || {};

    let subscription;
    if (userId) {
      subscription = await subscriptionRepo.findOne({
        where: {
          type: PROFILE,
          user: {
            id: req.user.id,
          },
          profileUser: {
            id: userId,
          },
        },
      });
    }

    const contents = await contentRepo.find({
      where: {
        type: "single-video",
        user: {
          id: userId || req.user.id,
        },
      },
      relations: {
        files: true,
        user: true,
      },
      order: {
        created_at: "DESC",
      },
      take: 10,
      skip: 0,
    });

    contents.forEach((content) => {
      let shouldSubscribe = content.content_type === "paid";
      if (subscription && Number(subscription.ended_at) * 1000 > Date.now()) {
        shouldSubscribe = false;
      }
      content.shouldSubscribe = shouldSubscribe;
    });

    res.json(contents);
  } catch (error) {
    next(error);
  }
};

export const getPlaylists = async (req, res, next) => {
  try {
    const { userId } = req.query || {};

    let subscription;
    if (userId) {
      subscription = await subscriptionRepo.findOne({
        where: {
          type: PROFILE,
          user: {
            id: req.user.id,
          },
          profileUser: {
            id: userId,
          },
        },
      });
    }

    const contents = await contentRepo.find({
      where: {
        type: "playlist",
        user: {
          id: userId || req.user.id,
        },
      },
      relations: {
        files: true,
        user: true,
      },
      order: {
        created_at: "DESC",
      },
      take: 10,
      skip: 0,
    });

    contents.forEach((content) => {
      let shouldSubscribe = content.content_type === "paid";
      if (subscription && Number(subscription.ended_at) * 1000 > Date.now()) {
        shouldSubscribe = false;
      }
      content.shouldSubscribe = shouldSubscribe;
    });

    res.json(contents);
  } catch (error) {
    next(error);
  }
};

export const viewVideo = async (req, res, next) => {
  try {
    const { id } = req.params || {};
    await videoRepo
      .createQueryBuilder("videos")
      .update(VideoEntity)
      .where("id = :id", { id })
      .set({ view_count: () => "view_count + 1" })
      .execute();

    const video = await videoRepo.findOneById(id);
    if (video) {
      res.json(video);
    } else {
      res.status(400).json({ msg: "Video does not exist." });
    }
  } catch (error) {
    next(error);
  }
};

export const viewContent = async (req, res, next) => {
  try {
    const { id } = req.params || {};
    await contentRepo
      .createQueryBuilder("contents")
      .update(ContentEntity)
      .where("id = :id", { id })
      .set({ view_count: () => "view_count + 1" })
      .execute();

    const content = await contentRepo.findOneById(id);
    if (content) {
      res.json(content);
    } else {
      res.status(400).json({ msg: "Content does not exist." });
    }
  } catch (error) {
    next(error);
  }
};
