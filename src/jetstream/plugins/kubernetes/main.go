package kubernetes

import (
	// "bytes"
	// "encoding/json"
	// "fmt"
	// "io"
	"net/url"
	"strings"

	"errors"

	"github.com/cloudfoundry-incubator/stratos/src/jetstream/config"
	"github.com/cloudfoundry-incubator/stratos/src/jetstream/repository/interfaces"
	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
)

type KubernetesSpecification struct {
	portalProxy  interfaces.PortalProxy
	endpointType string
}

const (
	EndpointType              = "k8s"
	CLIENT_ID_KEY             = "K8S_CLIENT"
	AuthConnectTypeKubeConfig = "KubeConfig"
)

func Init(portalProxy interfaces.PortalProxy) (interfaces.StratosPlugin, error) {
	return &KubernetesSpecification{portalProxy: portalProxy, endpointType: EndpointType}, nil
}

func (c *KubernetesSpecification) GetEndpointPlugin() (interfaces.EndpointPlugin, error) {
	return c, nil
}

func (c *KubernetesSpecification) GetRoutePlugin() (interfaces.RoutePlugin, error) {
	return c, nil
}

func (c *KubernetesSpecification) GetMiddlewarePlugin() (interfaces.MiddlewarePlugin, error) {
	return nil, errors.New("Not implemented!")
}

func (c *KubernetesSpecification) GetType() string {
	return EndpointType
}

func (c *KubernetesSpecification) GetClientId() string {
	if clientId, err := config.GetValue(CLIENT_ID_KEY); err == nil {
		return clientId
	}

	return "k8s"
}

func (c *KubernetesSpecification) Register(echoContext echo.Context) error {
	log.Debug("Kubernetes Register...")
	return c.portalProxy.RegisterEndpoint(echoContext, c.Info)
}

func (c *KubernetesSpecification) Connect(ec echo.Context, cnsiRecord interfaces.CNSIRecord, userId string) (*interfaces.TokenRecord, bool, error) {
	log.Debug("Kubernetes Connect...")

	connectType := ec.FormValue("connect_type")
	if !strings.EqualFold(connectType, AuthConnectTypeKubeConfig) {
		return nil, false, errors.New("Only Kubernetes config is accepted for Kubernetes endpoints")
	}

	tokenRecord, _, err := c.FetchKubeConfigToken(cnsiRecord, ec)
	if err != nil {
		return nil, false, err
	}

	return tokenRecord, false, nil
}

func (c *KubernetesSpecification) Init() error {
	return nil
}

func (c *KubernetesSpecification) AddAdminGroupRoutes(echoGroup *echo.Group) {
	// no-op
}

func (c *KubernetesSpecification) AddSessionGroupRoutes(echoGroup *echo.Group) {
	// no-op
}

func (c *KubernetesSpecification) Info(apiEndpoint string, skipSSLValidation bool) (interfaces.CNSIRecord, interface{}, error) {
	log.Debug("Kubernetes Info")
	var v2InfoResponse interfaces.V2Info
	var newCNSI interfaces.CNSIRecord

	newCNSI.CNSIType = EndpointType

	_, err := url.Parse(apiEndpoint)
	if err != nil {
		return newCNSI, nil, err
	}

	// No info endpoint that we can fetch to check if the Endpoint is K8S
	// We'll discover that when we try and connect

	// uri.Path = "v2/info"
	// h := c.portalProxy.GetHttpClient(skipSSLValidation)

	// res, err := h.Get(uri.String())
	// if err != nil {
	// 	return newCNSI, nil, err
	// }

	// if res.StatusCode != 200 {
	// 	buf := &bytes.Buffer{}
	// 	io.Copy(buf, res.Body)
	// 	defer res.Body.Close()

	// 	return newCNSI, nil, fmt.Errorf("%s endpoint returned %d\n%s", uri.String(), res.StatusCode, buf)
	// }

	// dec := json.NewDecoder(res.Body)
	// if err = dec.Decode(&v2InfoResponse); err != nil {
	// 	return newCNSI, nil, err
	// }

	newCNSI.TokenEndpoint = apiEndpoint
	newCNSI.AuthorizationEndpoint = apiEndpoint

	return newCNSI, v2InfoResponse, nil
}

func (c *KubernetesSpecification) UpdateMetadata(info *interfaces.Info, userGUID string, echoContext echo.Context) {
}
