package demo.booking.hairsalon.service.impl;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import demo.booking.hairsalon.config.GoogleProperties;
import demo.booking.hairsalon.exception.BusinessException;
import demo.booking.hairsalon.model.dto.GoogleUserInfo;
import demo.booking.hairsalon.model.enums.ErrorCode;
import demo.booking.hairsalon.service.GoogleAuthService;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class GoogleAuthServiceImpl implements GoogleAuthService {

    private final GoogleIdTokenVerifier verifier;

    public GoogleAuthServiceImpl(
            GoogleProperties googleProperties
    ) {
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        )
                .setAudience(
                        Collections.singletonList(
                                googleProperties.getClientId()
                        )
                )
                .build();
    }

    @Override
    public GoogleUserInfo verifyIdToken(String idToken) {

        try {

            GoogleIdToken googleIdToken = verifier.verify(idToken);

            if (googleIdToken == null) {
                throw new BusinessException(ErrorCode.INVALID_GOOGLE_TOKEN);
            }

            GoogleIdToken.Payload payload =
                    googleIdToken.getPayload();

            String email = payload.getEmail();

            String firstName = (String) payload.get("given_name");

            String lastName = (String) payload.get("family_name");

            return new GoogleUserInfo(payload.getSubject(), email, firstName, lastName);

        } catch (BusinessException ex) {
            throw ex;

        } catch (Exception ex) {
            throw new BusinessException(
                    ErrorCode.INVALID_GOOGLE_TOKEN
            );
        }
    }
}