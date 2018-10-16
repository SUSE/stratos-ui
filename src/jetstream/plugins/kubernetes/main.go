package kubernetes

import (
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
	EndpointType                = "k8s"
	CLIENT_ID_KEY               = "K8S_CLIENT"
	AuthConnectTypeKubeConfig   = "KubeConfig"
	AuthConnectTypeKubeConfigAz = "kubeconfig-az"
	AuthConnectTypeAWSIAM       = "aws-iam"
	AuthConnectTypeCertAuth     = "kube-cert-auth"
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

	// OIDC ?
	if strings.EqualFold(connectType, AuthConnectTypeKubeConfig) {
		tokenRecord, _, err := c.FetchKubeConfigTokenOIDC(cnsiRecord, ec)
		if err != nil {
			return nil, false, err
		}
		return tokenRecord, false, nil
	}
	// AKS ?
	if strings.EqualFold(connectType, AuthConnectTypeKubeConfigAz) {
		tokenRecord, _, err := c.FetchKubeConfigTokenAKS(cnsiRecord, ec)
		if err != nil {
			return nil, false, err
		}
		return tokenRecord, false, nil
	}

	// IAM Creds?
	if strings.EqualFold(connectType, AuthConnectTypeAWSIAM) {
		tokenRecord, _, err := c.FetchIAMToken(cnsiRecord, ec)
		if err != nil {
			return nil, false, err
		}
		return tokenRecord, false, nil
	}
	// Cert Auth?
	if strings.EqualFold(connectType, AuthConnectTypeCertAuth) {
		tokenRecord, _, err := c.FetchCertAuth(cnsiRecord, ec)
		if err != nil {
			return nil, false, err
		}
		return tokenRecord, false, nil
	}

	return nil, false, errors.New("Unsporrted Auth connectio type for Kubernetes endpoint")
}

func (c *KubernetesSpecification) Init() error {
	c.portalProxy.AddAuthProvider(AuthConnectTypeAWSIAM, interfaces.AuthProvider{
		Handler:  c.doAWSIAMFlowRequest,
		UserInfo: c.GetCNSIUserFromIAMToken,
	})
	c.portalProxy.AddAuthProvider(AuthConnectTypeCertAuth, interfaces.AuthProvider{
		Handler:  c.doCertAuthFlowRequest,
		UserInfo: c.GetCNSIUserFromCertAuth,
	})
	c.portalProxy.AddAuthProvider(AuthConnectTypeKubeConfigAz, interfaces.AuthProvider{
		Handler:  c.doCertAuthFlowRequest,
		UserInfo: c.GetCNSIUserFromCertAuth,
	})

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

	newCNSI.TokenEndpoint = apiEndpoint
	newCNSI.AuthorizationEndpoint = apiEndpoint

	return newCNSI, v2InfoResponse, nil
}

func (c *KubernetesSpecification) UpdateMetadata(info *interfaces.Info, userGUID string, echoContext echo.Context) {
}
