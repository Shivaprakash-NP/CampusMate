package com.collegemate.collegemate.syllabus.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Data
@Getter
@Setter
public class ResourceDto {
    private String type;
    private String url;
    private String title;
}
