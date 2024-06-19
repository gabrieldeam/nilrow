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
                        .requestMatchers(HttpMethod.GET, "/address").authenticated()
                        .requestMatchers(HttpMethod.GET, "/address/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/address").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/address/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/address/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/address/classifications").permitAll()
                        .requestMatchers(HttpMethod.GET, "/channels").authenticated()
                        .requestMatchers(HttpMethod.POST, "/channels").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/channels/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/channels/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/channels/my").authenticated()
                        .requestMatchers(HttpMethod.GET, "/channels/nickname/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/channels/is-owner/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/channels/{id}/upload-image").authenticated()
                        .requestMatchers(HttpMethod.POST, "/follows/follow/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/follows/unfollow/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/follows/is-following/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/follows/followers-count/**").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
