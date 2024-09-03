package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	router.Static("/public", "./public")

	router.GET("/login", getLogin)
	router.POST("/login", postLogin)

	router.POST("/app", requireAuth, func(ctx *gin.Context) {
		ctx.String(http.StatusOK, "app!")
	})

	api := router.Group("/api")
	api.Use(requireAuth)

	{
		api.POST("/greet", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"greet": "hi, authorized user!"})
		})
	}

	router.Run()
}
