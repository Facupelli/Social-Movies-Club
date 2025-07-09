import { UserService } from '@/users/user.service';
import { HomeClient } from './page.client';

const fetchUsers = async (pageNumber: number) => {
  const userService = new UserService();
  return await userService.searchUser({}, pageNumber, 10);
};

export default async function Home() {
  const users = await fetchUsers(1);

  console.dir({ users }, { depth: null });

  if (users.totalCount === 0) {
    return <p>No hay ningún usuario en la app de mierda esta</p>;
  }

  return (
    <div>
      {users.data.map((user) => (
        <div key={user.id}>{user.email}</div>
      ))}

      <HomeClient />
    </div>
  );
}
