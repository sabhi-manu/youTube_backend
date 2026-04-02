import mongoose from "mongoose";
import commentRepository from "../repositories/comment.repository.js";
import AppError from "../utils/Apperror.js";

const getVideoComments = async (videoId, page, limit) => {
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new AppError("video id not valid.", 400);
  }

  let pageNum = Number(page);
  let limitNum = Number(limit);

  const { comments, totalComments } = await commentRepository.getVideoComments(
    videoId,
    pageNum,
    limitNum,
  );

  return {
    comments,
    pagination: {
      totalComments,
      currentPage: pageNum,
      totalPages: Math.ceil(totalComments / limitNum),
    },
  };
};

const addComment = async (videoId, userId, content) => {
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new AppError("Invalid video id", 400);
  }
  if (!content || !content.trim()) {
    throw new AppError("Content is required", 400);
  }

  const comment = await commentRepository.createComment({
    content: content.trim(),
    owner: userId,
    video: videoId,
  });

  if (!comment) {
    throw new AppError("Failed to create comment", 500);
  }

  return comment;
};

const updateComment = async (commentId, userId, content) => {
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new AppError("comment id not valid.", 400);
  }
  if (!content || !content.trim()) {
    throw new AppError("content not provided.", 400);
  }

  const comment = await commentRepository.findCommentById(commentId);

  if (!comment) {
    throw new AppError("commenet not found .", 404);
  }

  if (comment.owner.toString() !== userId.toString()) {
    throw new AppError("UnAuthorized user .", 400);
  }
  comment.content = content.trim();
  const updateComment = await commentRepository.saveComment(comment);

  return updateComment;
};

const deletComment = async (userId, commentId) => {
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new AppError("comment id not valid.", 400);
  }

  const comment = await commentRepository.findCommentById(commentId);

  if (!comment) {
    throw new AppError("commenet not found .", 404);
  }

  if (comment.owner.toString() !== userId.toString()) {
    throw new AppError("UnAuthorized user .", 400);
  }

  await commentRepository.deleteCommentById(commentId);

  return true;
};

export default {
  getVideoComments,
  addComment,
  updateComment,
  deletComment,
};
