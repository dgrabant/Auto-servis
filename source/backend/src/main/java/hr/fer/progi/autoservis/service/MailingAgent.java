package hr.fer.progi.autoservis.service;

import com.mailjet.client.ClientOptions;
import com.mailjet.client.MailjetClient;
import com.mailjet.client.MailjetRequest;
import com.mailjet.client.MailjetResponse;
import com.mailjet.client.errors.MailjetException;
import com.mailjet.client.resource.Emailv31;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MailingAgent {

    @Value("${app.mailjet.key}")
    private String api_key;

    @Value("${app.mailjet.secret}")
    private String secret;

    @Value("${app.mailjet.sender}")
    private String sender;

    public boolean send(String to, String subject, String txtContent, String htmlContent) throws Exception {
        MailjetClient client;
        MailjetRequest request;
        MailjetResponse response;

        client = new MailjetClient(ClientOptions.builder().apiKey(api_key).apiSecretKey(secret).build());
        request = new MailjetRequest(Emailv31.resource)
                .property(Emailv31.MESSAGES, new JSONArray()
                        .put(new JSONObject()
                                .put(Emailv31.Message.FROM, new JSONObject()
                                        .put("Email", sender)
                                        .put("Name", "Auto-servis"))
                                .put(Emailv31.Message.TO, new JSONArray()
                                        .put(new JSONObject()
                                                .put("Email", to)
                                                .put("Name", to.split("@")[0])))
                                .put(Emailv31.Message.SUBJECT, subject)
                                .put(Emailv31.Message.TEXTPART, txtContent)
                                .put(Emailv31.Message.HTMLPART, htmlContent)));

        response = client.post(request);
        if(response.getStatus() == 200) return true;
        else throw new Exception(String.valueOf(response.getData()));
    }
}
