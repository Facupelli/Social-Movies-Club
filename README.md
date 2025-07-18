# 🎥 Social Movies Club

Welcome to the **Social Movies Club**! This is a social platform for movie enthusiasts to rate movies, share their opinions, and discover new films through their friends' activity. Whether you're looking to keep track of the movies you've watched or explore recommendations from your network, this app has you covered.

---

This monorepo contains two apps. _Web_ it is a Nextjs app that holds the main web app. _Queue-system_ is a NestJS app for handling jobs in a queue using _bullmq_.

---

🎓 **Personal Side-Project**  
This app is my way of learning how to build a small-scale social network while scratching a real itch: finding _actually_ good movies to watch.  
The best recommendations I ever get come from friends whose taste I trust—so I’m wiring that experience into code.  
Expect rough edges, frequent tweaks, and a lot of fun experiments along the way!

---

## 🚀 Features

### 1. **User Profiles**

- Each user has a personal profile that displays all the movies they've rated.
- Ratings are stored in a list, allowing users to revisit their movie history and share it with others.

### 2. **Social Feed**

- Follow other users to see their recent movie ratings in your feed.
- The feed updates in real-time, showing the latest activity from the users you follow.
- Discover new movies and see what your friends think about them.

### 3. **Discover Movies Through Friends**

- Get inspired by your friends' ratings to find your next movie to watch.
- See how your taste in movies aligns with others in your network.

---

## 🛠️ Tech Stack

This app is built with the following technologies:

- **[Next.js 15](https://nextjs.org/)**: A React framework for building fast and scalable web applications.
- **[React](https://reactjs.org/)**: A JavaScript library for building user interfaces.
- **[PostgreSQL](https://www.postgresql.org/)**: A powerful, open-source relational database for storing user data and movie ratings.
- **[Drizzle ORM](https://orm.drizzle.team/)**: A lightweight and type-safe ORM for interacting with the database.

---

## 📋 To-Do List

Here are the next steps to improve and expand the app:

- [x] **Add server-side input validation**: Validate user inputs on the server to enhance security and data integrity.
- [x] **Make the app responsive**: Ensure the app works seamlessly on all devices, including mobile, tablet, and desktop.
- [x] **Implement the feed feature**: Build the feed functionality to display the recent ratings of users you follow.
- [x] **Add pagination**: Add pagination to Feed.
- [x] **Add pagination to profile**: Add pagination to User Profile.
- [x] **Add followers and following count**: Add count to user profile.
- [x] **Check if movie is already scored**: Add rate check to MovieCard.
- [x] **Show followers**: Show followers user profiles links.
- [x] **Add watchlist feature**: Implement watchlist feature: add, remove and list watchlist.
- [x] **Add series**: Add the same features for series/TV shows.
- [x] **Show diff between profiles**: Filter out rated movies when visiting another profiles.
- [x] **Add media-type filter**: Add media-type filter to search bar.
- [ ] **Handle repeated rated movies**: Add some way to handle repeated rated movies if they are close enough on the feed (maybe an aggregate table).
- [ ] **Add block movie from feed**: Handle blocked movies from feed according to user preference.
- [ ] **Add optimistic Uis**: Add optimistic updates for add-to-watchlist, remove-from-watchlist, follow-user.
- [ ] **Add movie country flag**: Add the movie country flag to the Movie Card.
- [ ] **Add _seenAt_ feature to feed posts**.

---

## 💡 How It Works

1. **Rate Movies**: After watching a movie, rate it on a scale of 1 to 10. Your rating will be added to your profile.
2. **Follow Users**: Follow your friends or other users to see their activity in your feed.
3. **Explore the Feed**: Check your feed to discover movies your friends have rated and see their opinions.
4. **View Profiles**: Visit your profile or other users' profiles to see all the movies they've rated.

---

## 🎯 Vision

The Movies App is designed to make movie discovery a social experience. By connecting with friends and sharing ratings, users can explore new films, revisit classics, and engage in conversations about their favorite movies.

---
