package hr.fer.progi.autoservis.security;

import hr.fer.progi.autoservis.model.Korisnik;
import hr.fer.progi.autoservis.service.KorisnikService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final KorisnikService userService;
    private final String frontendRedirectUrl;

    public OAuth2SuccessHandler(JwtTokenProvider jwtTokenProvider, KorisnikService userService,
                                              @Value("${app.oauth.redirect-url}") String frontendRedirectUrl) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService;
        this.frontendRedirectUrl = frontendRedirectUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {

        String finalFrontendUrl;
        if ("true".equals(request.getParameter("local_redirect"))) {
            finalFrontendUrl = "http://localhost:5173/oauth-redirect";
        } else {
            finalFrontendUrl = this.frontendRedirectUrl;
        }

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        Korisnik localUser = userService.processOAuth2User(oauthUser);
        String token = jwtTokenProvider.generateToken(localUser);
        String targetUrl = UriComponentsBuilder.fromUriString(finalFrontendUrl)
                .queryParam("token", token)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}