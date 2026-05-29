package com.cafeteria.api.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import jakarta.annotation.PostConstruct;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

@TestPropertySource(properties = "spring.main.allow-bean-definition-overriding=true")
class AuthFlowIntegrationTest extends AbstractIntegrationTest {

    @Autowired WebApplicationContext context;
    @Autowired ObjectMapper objectMapper;

    private MockMvc mockMvc;

    @PostConstruct
    void setupMockMvc() {
        // será chamado pelo Spring após injeção
    }

    private MockMvc mvc() {
        if (mockMvc == null) {
            mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
        }
        return mockMvc;
    }

    @Test
    void deveRegistrarLoginRefreshELogout() throws Exception {
        String email = "user" + System.currentTimeMillis() + "@cafeteria.com";
        String body = """
                {"name":"Teste","email":"%s","password":"Senha@123"}""".formatted(email);

        // Register
        MvcResult registerRes = mvc().perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode registerJson = objectMapper.readTree(registerRes.getResponse().getContentAsString());
        assertThat(registerJson.get("accessToken").asText()).isNotBlank();
        String refresh = registerJson.get("refreshToken").asText();
        assertThat(refresh).isNotBlank();

        // Login
        String loginBody = """
                {"email":"%s","password":"Senha@123"}""".formatted(email);
        mvc().perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk());

        // Refresh
        String refreshBody = """
                {"refreshToken":"%s"}""".formatted(refresh);
        mvc().perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(refreshBody))
                .andExpect(status().isOk());

        // Refresh duplicado deve falhar (rotação)
        mvc().perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(refreshBody))
                .andExpect(status().isUnauthorized());
    }
}
