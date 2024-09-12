package marketplace.nilrow.infra.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfigurations {

    @Autowired
    private SecurityFilter securityFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-resources/**", "/swagger-ui.html").permitAll()
                        .requestMatchers(HttpMethod.GET, "/images/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/login-phone").permitAll()
                        .requestMatchers(HttpMethod.GET, "/auth/validate-email").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/forgot-password").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/reset-password").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/logout").permitAll()
                        .requestMatchers(HttpMethod.GET, "/auth/check").permitAll()
                        .requestMatchers(HttpMethod.POST, "/product").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/people").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/people").authenticated()
                        .requestMatchers(HttpMethod.GET, "/people/accepts-sms").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/people/accepts-sms").authenticated()
                        .requestMatchers(HttpMethod.GET, "/people/email-validated").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/user/nickname").authenticated()
                        .requestMatchers(HttpMethod.GET, "/user/nickname").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/user").authenticated()
                        .requestMatchers(HttpMethod.GET, "/user/all/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/address").authenticated()
                        .requestMatchers(HttpMethod.GET, "/address/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/address").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/address/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/address/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/address/classifications").permitAll()
                        .requestMatchers(HttpMethod.GET, "/channels").permitAll()
                        .requestMatchers(HttpMethod.POST, "/channels").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/channels/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/channels/{id}/toggle-visibility").authenticated()
                        .requestMatchers(HttpMethod.GET, "/channels/my").authenticated()
                        .requestMatchers(HttpMethod.GET, "/channels/nickname/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/channels/is-owner/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/channels/{id}/upload-image").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/channels/{id}/upload-image").authenticated()
                        .requestMatchers(HttpMethod.GET, "/channels/person/{personId}/channel").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/follows/follow/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/follows/unfollow/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/follows/is-following/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/follows/followers-count/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/follows/followers/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/follows/following-channels/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/follows/following-count/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/chats/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/chats/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/chats/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/chats/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/about/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/about/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/about/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/about/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/faqs/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/faqs/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/faqs/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/faqs/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/catalog/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/catalog/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/catalog/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/catalog/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/catalog/release/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/catalog/visibility/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/locations/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/locations/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/locations/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/categories/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/subcategory/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/subcategory/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/subcategory/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/subcategory/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/user-category-order/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/user-category-order/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/user-category-order/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/user-category-order/**").authenticated()
                        .requestMatchers("/uploads/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
