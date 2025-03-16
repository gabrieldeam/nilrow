package marketplace.nilrow.controllers;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import marketplace.nilrow.domain.catalog.shipping.MelhorEnvioTokenEntity;
import marketplace.nilrow.repositories.MelhorEnvioTokenRepository;
import marketplace.nilrow.services.OAuthStateService;
import marketplace.nilrow.services.MelhorEnvioAuthService;
import marketplace.nilrow.services.MelhorEnvioAuthService.TokenResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/melhorenvio")
public class MelhorEnvioAuthController {

    @Autowired
    private MelhorEnvioAuthService authService;

    @Autowired
    private MelhorEnvioTokenRepository tokenRepository;

    @Value("${app.frontend.url}")
    private String frontendBaseUrl;

    @Autowired
    private OAuthStateService oAuthStateService;


    /**
     * Endpoint para iniciar o fluxo de autorização.
     * Exemplo de chamada:
     *   GET /api/melhorenvio/authorize?ownerId=CANAL123
     */
    // Injeção do serviço de state
    @Autowired
    private OAuthStateService AuthStateService;

    @GetMapping("/authorize")
    public String authorize(@RequestParam(name = "ownerId", required = true) String ownerId) {
        String scopes = String.join(" ",
                "shipping-calculate",
                "shipping-cancel",
                "shipping-checkout",
                "shipping-companies",
                "shipping-generate",
                "shipping-preview",
                "shipping-print",
                "shipping-share",
                "shipping-tracking",
                "ecommerce-shipping"
        );

        // Gere o state associando ao ownerId usando o OAuthStateService
        String state = oAuthStateService.generateState(ownerId);

        // Constrói a URL de autorização com o state gerado
        String authorizationUrl = authService.buildAuthorizeUrl(scopes, state);
        return "Abra essa URL para autorizar: \n" + authorizationUrl;
    }




    /**
     * Endpoint de callback: o Melhor Envio redireciona para cá depois que o usuário
     * aprova (ou nega) o acesso do app.
     *
     * Exemplo de callback configurado:
     *   https://SEU_NGROK/api/melhorenvio/callback
     */
    @Value("${app.frontend.url}")
    private String appFrontendUrl;

    @GetMapping("/callback")
    public void callback(@RequestParam(name = "code", required = false) String code,
                         @RequestParam(name = "error", required = false) String error,
                         @RequestParam(name = "state", required = false) String state,
                         HttpServletResponse response) throws IOException {
        if (error != null) {
            log.error("Erro na autorização: {}", error);
            response.getWriter().write("Erro na autorização: " + error);
            return;
        }

        // Use o state para recuperar o ownerId
        String ownerId = (state != null) ? oAuthStateService.consumeState(state) : null;
        if (ownerId == null) {
            log.warn("OwnerId não encontrado para o state: {}", state);
            response.getWriter().write("Falha ao identificar o catálogo (ownerId).");
            return;
        }

        try {
            TokenResponse tokenResponse = authService.requestAccessToken(code);

            MelhorEnvioTokenEntity tokenEntity = new MelhorEnvioTokenEntity();
            tokenEntity.setOwnerId(ownerId);
            tokenEntity.setAccessToken(tokenResponse.accessToken);
            tokenEntity.setRefreshToken(tokenResponse.refreshToken);
            tokenEntity.setExpiresIn(tokenResponse.expiresIn);
            tokenEntity.setCreatedAt(Instant.now().getEpochSecond());

            tokenRepository.save(tokenEntity);

            log.info("Autorização concedida! Owner/Canal: {}", ownerId);
            String message = "Autorização concedida!\n" +
                    "Owner/Canal: " + ownerId + "\n" +
                    "Access Token: " + tokenResponse.accessToken + "\n" +
                    "Refresh Token: " + tokenResponse.refreshToken + "\n" +
                    "Expira em (segundos): " + tokenResponse.expiresIn;
            response.getWriter().write(message);
        } catch (Exception e) {
            log.error("Erro ao obter token do Melhor Envio: ", e);
            response.getWriter().write("Falha ao obter token. Ver logs no servidor.");
        }
    }


    // Exemplo adicional no Controller:
    @GetMapping("/status")
    public Map<String, Boolean> status(@RequestParam("ownerId") String ownerId) {
        boolean exists = tokenRepository.findByOwnerId(ownerId).isPresent();
        return Collections.singletonMap("activated", exists);
    }

    @DeleteMapping
    public ResponseEntity<?> deactivate(@RequestBody Map<String, String> body) {
        String ownerId = body.get("ownerId");
        // Busque o token do DB e apague
        List<MelhorEnvioTokenEntity> tokens = tokenRepository.findAllByOwnerId(ownerId);
        tokenRepository.deleteAll(tokens);

        return ResponseEntity.ok().build();
    }

}
