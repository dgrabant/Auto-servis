package hr.fer.progi.autoservis.security;

import hr.fer.progi.autoservis.service.KorisnikService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final KorisnikService userService;

    @Value("${app.oauth.logout-url}")
    String logoutUrl;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider, KorisnikService userService) {
        this.tokenProvider = tokenProvider;
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String jwt = getJwtFromRequest(request);

            if (jwt != null && tokenProvider.validateToken(jwt)) {
                Integer userId = tokenProvider.getUserIdFromToken(jwt);

                UserDetails userDetails = userService.loadUserById(userId);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
            else response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
        }
        catch (UsernameNotFoundException exception){
            logger.warn("Pokušaj prijave s obrisanim korisnikom ["+request.getRequestURI()+"]");
            SecurityContextHolder.clearContext();

            response.sendRedirect(logoutUrl);
        }
        catch (Exception ex){
            logger.error("Greska pri postavljanju korisnicke autentifikacije", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}