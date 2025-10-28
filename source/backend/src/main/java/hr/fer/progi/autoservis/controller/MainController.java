package hr.fer.progi.autoservis.controller;

import hr.fer.progi.autoservis.model.TestingModel;
import hr.fer.progi.autoservis.repository.TestingRepository;
import org.springframework.boot.info.BuildProperties;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class MainController {

    private final TestingRepository repo;

    public MainController(TestingRepository repository){
        this.repo = repository;
    }

    @GetMapping("/page")
    public String page(Model model){
        List<TestingModel> list = repo.findAll();
        model.addAttribute("services", list);

        return "dynamic";
    }
}
