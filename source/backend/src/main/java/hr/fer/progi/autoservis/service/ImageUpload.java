package hr.fer.progi.autoservis.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Component
public class ImageUpload {

    @Value("${app.imgbb.key}")
    private String api_key;

    public String SendRequest(String base64){

        if(api_key.isEmpty()) return "";
        if(base64.isEmpty()) return "";

        RestTemplate restTemplate = new RestTemplate();
        ObjectMapper objectMapper = new ObjectMapper();

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("key", api_key);
        body.add("image", base64);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

        String uri = "https://api.imgbb.com/1/upload";
        ResponseEntity<String> response = restTemplate.postForEntity(
                uri,
                request,
                String.class
        );

        try {
            JsonNode json = objectMapper.readTree(response.getBody());

            return json.path("data").path("display_url").asText();

        } catch (JsonProcessingException e) {
            return "";
        }
    }
}
