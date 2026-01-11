package com.collegemate.collegemate.demoTesting;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class demo {
    @GetMapping("/")
    public String ret() {
        return "HELLO SHIVA";
    }
}
