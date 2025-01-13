import { removeItemFromCookie } from "@/utils/cookiesFunc";
import { RemoveItemFromLocalStorage } from "@/utils/localStorageFunc";
import { usePathname, useRouter } from "next/navigation";

export const useLogoutFunc = () => {
  const router = useRouter();
  const pathname = usePathname();

  const logout = (url: string) => {
    if (pathname.startsWith("/admin")) {
      removeItemFromCookie("adminToken");
      RemoveItemFromLocalStorage("adminUser");
    } else {
      removeItemFromCookie("token");
      RemoveItemFromLocalStorage("user");
    }
    router.push(url);
  };

  return logout;
};
