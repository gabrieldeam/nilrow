package marketplace.nilrow.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

public class CookieUtil {

    public static void addAuthCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("auth_token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Defina como true em produção
        cookie.setPath("/");
        cookie.setMaxAge(60 * 60 * 24); // Expira em 1 dia
        response.addCookie(cookie);
    }

    public static void removeAuthCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("auth_token", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Defina como true em produção
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
