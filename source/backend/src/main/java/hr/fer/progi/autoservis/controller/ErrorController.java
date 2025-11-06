package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.Map;

@Controller
public class ErrorController implements org.springframework.boot.web.servlet.error.ErrorController {

    @RequestMapping("/error")
    @ResponseBody
    public Map<String, Object> handleError(HttpServletRequest request, @AuthenticationPrincipal UserPrincipal userPrincipal){
        Object status = request.getAttribute("javax.servlet.error.status_code");
        HttpStatus httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        if (status != null) {
            int statusCode = Integer.parseInt(status.toString());
            httpStatus = HttpStatus.valueOf(statusCode);
        }

        Map<String, Object> error = new HashMap<>();

        if(userPrincipal==null){
            error.put("status",401);
            return error;
        }

        int httpCode = httpStatus.value();

        error.put("status",httpCode);
        if(httpCode>=400 && httpCode<500) error.put("message","A client error has occurred. Bad request.");
        else if(httpCode>=500 && httpCode<600) error.put("message","A server error has occurred. Internal server error.");
        else error.put("message","An error has occurred.");
        return error;
    }
}
