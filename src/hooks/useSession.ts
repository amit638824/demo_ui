import { useSelector } from "react-redux";
export const useSession = () => {
  const { user, token, permissions  } = useSelector((state: any) => state?.user);
  return {
    user,
    token,
    permissions: permissions || [],   // NEW
    roleId: user?.roletbl_id,         // NEW
    roleName: user?.roletbl_roleName, // NEW
    isLoggedIn: !!token,
  };
};
export const useUser = () => {
  const userDetail = useSelector(
    (state: any) => state.userDetail.userDetail
  );

  return {
    ...(userDetail || {}),
    isLoggedIn: !!userDetail,
  };
};
