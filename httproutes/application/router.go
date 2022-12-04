package application

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/jakemakesstuff/spherical/httproutes/application/apiv1"
	"github.com/jakemakesstuff/spherical/httproutes/shared"
)

// Router is used to return this packages router.
func Router(dev bool) http.Handler {
	r := mux.NewRouter()

	r.PathPrefix("/setup").HandlerFunc(func(writer http.ResponseWriter, req *http.Request) {
		http.Redirect(writer, req, "/", http.StatusPermanentRedirect)
	})
	apiv1.Router(r.PathPrefix("/api/v1").Subrouter())

	shared.Router(r, dev)

	return r
}
