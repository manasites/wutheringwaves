import type { CollectionConfig } from "payload/types";

import type { User } from "payload/generated-types";

import { isOwnComment, isCommentDeletedField } from "../../access/comments";
import { canMutateFieldAsSiteAdmin } from "../../access/site";
import { isLoggedIn } from "../../access/user";

export const Comments: CollectionConfig = {
   slug: "comments",
   access: {
      create: isLoggedIn,
      read: () => true,
      update: isOwnComment,
      delete: isOwnComment,
   },
   fields: [
      {
         name: "comment",
         type: "json",
         access: {
            read: isCommentDeletedField,
         },
      },
      {
         name: "isDeleted",
         type: "checkbox",
      },
      {
         name: "isPinned",
         type: "checkbox",
         access: {
            update: canMutateFieldAsSiteAdmin("comments"),
         },
      },
      {
         name: "site",
         type: "relationship",
         relationTo: "sites",
         required: true,
         access: {
            update: () => false,
         },
      },
      {
         name: "postParent",
         type: "relationship",
         relationTo: "posts",
         access: {
            update: () => false,
         },
      },
      {
         name: "sectionParentCollection",
         type: "relationship",
         relationTo: "collections",
         access: {
            update: () => false,
         },
      },
      {
         name: "sectionParentId",
         type: "text",
         access: {
            update: () => false,
         },
      },
      {
         name: "isTopLevel",
         type: "checkbox",
         defaultValue: false,
         access: {
            update: () => false,
         },
      },
      {
         name: "upVotesStatic",
         type: "number",
         access: {
            update: () => false,
         },
      },
      {
         name: "replies",
         type: "relationship",
         relationTo: "comments",
         hasMany: true,
         access: {
            update: () => false,
         },
      },
      {
         name: "upVotes",
         type: "relationship",
         relationTo: "users",
         hasMany: true,
         maxDepth: 0,
         access: {
            update: () => false,
         },
      },
      {
         name: "author",
         type: "relationship",
         relationTo: "users",
         required: true,
         defaultValue: ({ user }: { user: User }) => user?.id,
         access: {
            read: isCommentDeletedField,
            update: () => false,
         },
      },
      {
         name: "maxCommentDepth",
         type: "number",
         access: {
            update: () => false,
         },
      },
   ],
};