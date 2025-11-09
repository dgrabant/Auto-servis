package hr.fer.progi.autoservis.security;

import hr.fer.progi.autoservis.model.Korisnik;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms:86400000}") // 24 sata
    private int jwtExpirationMs;

    public String generateToken(Korisnik user) {
        String subject = String.valueOf(user.getIdKorisnik());
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder().subject(subject).issuedAt(now).expiration(expiryDate).signWith(key()).compact();
    }

    private SecretKey key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    public Integer getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key())
                .build().parseSignedClaims(token).getPayload();

        return Integer.parseInt(claims.getSubject());
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().verifyWith(key()).build().parse(authToken);
            return true;
        } catch (MalformedJwtException ex) {
            logger.error("Neispravan JWT token");
        } catch (ExpiredJwtException ex) {
            logger.error("JWT token je istekao");
        } catch (UnsupportedJwtException ex) {
            logger.error("Nepodrzani JWT token");
        } catch (IllegalArgumentException ex) {
            logger.error("JWT token je nevaljan");
        }
        return false;
    }
}