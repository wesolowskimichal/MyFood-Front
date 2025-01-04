export const GetLikes = (likes: number): string => {
  if (likes > 999) {
    return (likes / 1000).toPrecision(1) + 'k+'
  }
  return likes.toString()
}
