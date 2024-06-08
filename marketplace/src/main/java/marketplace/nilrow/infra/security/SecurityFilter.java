package marketplace.nilrow.infra.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import marketplace.nilrow.repositories.UserRepository;
import marketplace.nilrow.services.PhoneAuthorizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(SecurityFilter.class);

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PhoneAuthorizationService phoneAuthorizationService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        var token = tokenService.extractTokenFromRequest(request); // Atualizado para usar o método correto
        if (token != null) {
            if (!tokenService.isBlacklisted(token)) { // Verifica se o token não está na lista negra
                var login = tokenService.validateToken(token);
                if (login != null) {
                    logger.debug("Token validated. Login: {}", login);
                    UserDetails user = userRepository.findByNickname(login);
                    if (user == null) {
                        user = phoneAuthorizationService.loadUserByUsername(login);
                    }
                    if (user != null) {
                        logger.debug("User authenticated: {}", user.getUsername());
                        var authentication = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                } else {
                    logger.debug("Token validation failed.");
                }
            } else {
                // Token está na lista negra, negar acesso
                logger.debug("Token is blacklisted.");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}
