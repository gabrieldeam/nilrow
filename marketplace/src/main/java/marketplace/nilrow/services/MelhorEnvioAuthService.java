package marketplace.nilrow.services;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Map;

@Slf4j
@Service
public class MelhorEnvioAuthService {

    @Value("${melhorenvio.sandbox.url}")
    private String melhorEnvioBaseUrl;

    @Value("${melhorenvio.client-id}")
    private String clientId;

    @Value("${melhorenvio.client-secret}")
    private String clientSecret;

    @Value("${melhorenvio.callback-url}")
    private String callbackUrl;

    private final RestTemplate restTemplate;

    public MelhorEnvioAuthService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Constrói a URL para redirecionar o usuário e solicitar autorização do app.
     * @param scopes lista de scopes solicitadas (separadas por espaço)
     * @param state parâmetro opcional para manter estado no callback (ex: userId)
     * @return URL completa de autorização
     */
    public String buildAuthorizeUrl(String scopes, String state) {
        // Exemplo: https://sandbox.melhorenvio.com.br/oauth/authorize?client_id=XXX&redirect_uri=YYY&response_type=code&scope=ZZZ
        StringBuilder sb = new StringBuilder();
        sb.append(melhorEnvioBaseUrl).append("/oauth/authorize")
                .append("?client_id=").append(clientId)
                .append("&redirect_uri=").append(callbackUrl)
                .append("&response_type=code")
                .append("&scope=").append(scopes);

        if (state != null && !state.isBlank()) {
            sb.append("&state=").append(state);
        }

        log.info("URL gerada para autorização do usuário: {}", sb.toString());
        return sb.toString();
    }

    /**
     * Solicita o token de acesso/refresh via "authorization_code".
     * @param code recebido no callback
     * @return objeto contendo access_token, refresh_token etc.
     */
    public TokenResponse requestAccessToken(String code) {
        String url = melhorEnvioBaseUrl + "/oauth/token";

        // Monta o payload JSON
        Map<String, String> requestBody = Map.of(
                "grant_type", "authorization_code",
                "client_id", clientId,
                "client_secret", clientSecret,
                "redirect_uri", callbackUrl,
                "code", code
        );

        // Monta os headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        headers.add("User-Agent", "NilrowApp (oficialnilrow@gmail.com)");

        // Cria a requisição
        HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);

        log.info("Solicitando access_token ao Melhor Envio...");
        log.info("URL: {}", url);
        log.info("Body Enviado: {}", requestBody);

        ResponseEntity<TokenResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                TokenResponse.class
        );

        log.info("Response Status: {}", response.getStatusCode());
        log.info("Response Body: {}", response.getBody());

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return response.getBody();
        } else {
            throw new RuntimeException("Falha ao solicitar token do Melhor Envio. Status: " + response.getStatusCode());
        }
    }

    /**
     * Solicita um novo token via "refresh_token".
     */
    public TokenResponse refreshAccessToken(String refreshToken) {
        String url = melhorEnvioBaseUrl + "/oauth/token";

        Map<String, String> requestBody = Map.of(
                "grant_type", "refresh_token",
                "client_id", clientId,
                "client_secret", clientSecret,
                "refresh_token", refreshToken
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        headers.add("User-Agent", "NilrowApp (oficialnilrow@gmail.com)");

        HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);

        log.info("Renovando access_token via refresh_token...");
        log.info("URL: {}", url);
        log.info("Body Enviado: {}", requestBody);

        ResponseEntity<TokenResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                TokenResponse.class
        );

        log.info("Response Status: {}", response.getStatusCode());
        log.info("Response Body: {}", response.getBody());

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return response.getBody();
        } else {
            throw new RuntimeException("Falha ao renovar token do Melhor Envio. Status: " + response.getStatusCode());
        }
    }

    /**
     * Classe auxiliar para mapear o retorno do token.
     * {
     *   "token_type": "Bearer",
     *   "expires_in": 2592000,
     *   "access_token": "...",
     *   "refresh_token": "...",
     *   ...
     * }
     */
    public static class TokenResponse {
        @JsonProperty("token_type")
        public String tokenType;

        @JsonProperty("expires_in")
        public Long expiresIn;

        @JsonProperty("access_token")
        public String accessToken;

        @JsonProperty("refresh_token")
        public String refreshToken;

        @Override
        public String toString() {
            return "TokenResponse{" +
                    "tokenType='" + tokenType + '\'' +
                    ", expiresIn=" + expiresIn +
                    ", accessToken='" + accessToken + '\'' +
                    ", refreshToken='" + refreshToken + '\'' +
                    '}';
        }
    }
}
