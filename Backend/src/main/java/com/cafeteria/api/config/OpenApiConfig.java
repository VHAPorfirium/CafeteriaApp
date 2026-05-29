package com.cafeteria.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

        private static final String SCHEME = "bearerAuth";

        @Bean
        public OpenAPI cafeteriaOpenAPI() {
                return new OpenAPI()
                                .info(new Info()
                                                .title("Cafeteria API")
                                                .description("Backend da Cafeteria — Trabalho Final Desenvolvimento Web")
                                                .version("1.0.0")
                                                .contact(new Contact().name("Victor Hugo")
                                                                .email("vhaporfiro@gmail.com"))
                                                .license(new License().name("MIT")))
                                .addSecurityItem(new SecurityRequirement().addList(SCHEME))
                                .components(new Components().addSecuritySchemes(SCHEME,
                                                new SecurityScheme()
                                                                .name(SCHEME)
                                                                .type(SecurityScheme.Type.HTTP)
                                                                .scheme("bearer")
                                                                .bearerFormat("JWT")));
        }
}
