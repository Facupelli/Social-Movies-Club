import { MovieService } from '@/movies/movie.service';
import { UserService } from '@/users/user.service';

const fetchUsers = async (pageNumber: number) => {
  const userService = new UserService();
  return await userService.searchUser({}, pageNumber, 10);
};

const fetchSomeMovie = async () => {
  const movieService = new MovieService();
  return await movieService.searchMovie('Pulp Fiction');
};

export default async function Home() {
  const users = await fetchUsers(1);
  // const movie = await fetchSomeMovie();

  // console.dir({ users, movie }, { depth: null });

  if (users.totalCount === 0) {
    return <p>No hay ningún usuario en la app de mierda esta</p>;
  }

  return (
    <div>
      {users.data.map((user) => (
        <div key={user.id}>{user.email}</div>
      ))}
    </div>
  );
}
