export const activeCommentWhere = { deletedAt: null } as const;

export const postAuthorSelect = {
  id: true,
  profile: {
    select: {
      firstName: true,
      lastName: true,
      nickname: true,
      avatarUrl: true,
      collegeName: true,
      department: true,
    },
  },
} as const;

export function postInclude() {
  return {
    author: { select: postAuthorSelect },
    category: true,
    _count: {
      select: {
        likes: true,
        comments: { where: activeCommentWhere },
      },
    },
  } as const;
}

export const activePostWhere = {
  deletedAt: null,
  isPublished: true,
} as const;
