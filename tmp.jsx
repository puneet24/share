import React from 'react';
import PropTypes from 'prop-types';
import {
  BarProgress, Button, Icon, Anchor, Dropdown, Input, Tooltip,
} from 'axp-base';
import { Step, Steps, Wizard } from 'axp-wizard/build';
import inputValidations from '../utils/inputValidations';
import * as analytics from '../commons/AnalyticsConstants';

// eslint-disable-next-line complexity
const MerchantRate = (props) => {
  const {
    customerRate,
    links,
    errors,
    dmaGetPricingRate,
    saveCustomerRate,
    moduleState,
    saveSelectPage,
    updateContextPath,
  } = props;

  const selectPage = { ...moduleState.selectPage };
  const customerRateState = { ...moduleState.customerRate };
  const { initialRateAnalytics } = moduleState.customerRate;
  const bpSection = { ...moduleState.businessProfile };
  const { applicationId } = moduleState;

  React.useEffect(() => {
    updateContextPath('amex-rate');
    const getPricingRate = dmaGetPricingRate(
      applicationId,
      bpSection.country).promise;
    // eslint-disable-next-line complexity
    getPricingRate.then((data) => {
      const warmlyWelcomeRatePageStatus = {
        ...moduleState.customerRate,
        warmlyWelcomeRate: data.welcome_rate,
        industryRate: data.industry_rate.rate,
        nextWelcomeRate: data.high_volume_rate,
        industryRateAddendaCode: data.industry_rate.addenda_code,
        discountRate: {
          discountRateAddendaCode: ((customerRateState.serviceChargeInitial === false
            && data.discount_rate !== undefined) ? data.discount_rate.addenda_code : 0),
          fiftyK: ((data.discount_rate !== undefined
            && customerRateState.serviceChargeInitial === false
            && data.discount_rate.addenda_code === 'ASMP6') ? data.discount_rate.discount_rate['50K'] : 0),
          hundreadK: ((data.discount_rate !== undefined
            && customerRateState.serviceChargeInitial === false
            && data.discount_rate.addenda_code === 'ASMP6') ? data.discount_rate.discount_rate['100K'] : 0),
          fiveHundreadK: ((data.discount_rate !== undefined
            && customerRateState.serviceChargeInitial === false
            && data.discount_rate.addenda_code === 'ASML1') ? data.discount_rate.discount_rate['500K'] : 0),
        },
        // eslint-disable-next-line no-nested-ternary
        initialRateAnalytics: ((data.discount_rate !== undefined
            && data.discount_rate.discount_rate['50K'] > 0)
            ? data.discount_rate.discount_rate['50K']
            : data.discount_rate !== undefined && data.discount_rate.discount_rate['500K']
              ? data.discount_rate.discount_rate['500K']
              : data.welcome_rate
        ),
      };
      saveCustomerRate(warmlyWelcomeRatePageStatus);
    }).catch(error => Promise.reject(error));
  }, [moduleState.customerRate.initialRateAnalytics]);

  const handleOnChangeSurchargeAmexCards = (event) => {
    if (event.value === '1' || event.value === '2') {
      const updatedCustomerRate = {
        ...moduleState.customerRate,
        showAdditionalRatesQuestionsWarnings: false,
        showAdditionalRatesProvideWarnings: false,
        currentOnSurchargeAmexCard: {
          value: event.value,
          label: event.label,
          touched: true,
          isValid: event.value > 0,
        },
      };
      saveCustomerRate(updatedCustomerRate);
    } else {
      const updatedCustomerRate = {
        ...moduleState.customerRate,
        serviceCharge: true,
        showAdditionalRatesQuestionsWarnings: false,
        currentOnSurchargeAmexCard: {
          value: event.value,
          label: event.label,
          touched: true,
          isValid: event.value > 0,
        },
      };
      saveCustomerRate(updatedCustomerRate);
    }
  };

  const onProvideSurchargeRate = (val) => {
    const valA = val.replace('%', '');
    if (valA > 0 && valA <= 100) {
      const AdditionalRateSummaryPageStatus = {
        ...moduleState.customerRate,
        showAdditionalRatesQuestionsWarnings: false,
        showAdditionalRatesProvideWarnings: false,
        currentProvideSurchargeRate: {
          value: `${valA}%`,
          isValid: inputValidations.isPercentageValid(valA),
        },
      };
      saveCustomerRate(AdditionalRateSummaryPageStatus);
    } else {
      const AdditionalRateSummaryPageStatus = {
        ...moduleState.customerRate,
        showAdditionalRatesProvideWarnings: true,
        currentProvideSurchargeRate: {
          value: `${valA}%`,
          isValid: false,
        },
      };
      saveCustomerRate(AdditionalRateSummaryPageStatus);
    }
  };

  const onClickMoveToTocPage = () => {
    selectPage.item = 'tableOfContent';
    saveSelectPage(selectPage);
  };

  const onClickChangeStateOne = () => {
    const currentOnSurchargeAmexCardValue = customerRateState.currentOnSurchargeAmexCard.value;
    const
      currentProvideSurchargeRateIsValid = customerRateState.currentProvideSurchargeRate.isValid;
    if (currentOnSurchargeAmexCardValue === '3') {
      if (currentProvideSurchargeRateIsValid) {
        const AdditionalRateSummaryPageStatus = {
          ...moduleState.customerRate,
          customerSurchargeCode: parseInt(customerRateState.currentOnSurchargeAmexCard.value, 10),
          customerSurchargeRate: parseFloat(customerRateState.currentProvideSurchargeRate.value),
          surchargeAnalytics: 'higher',
        };
        saveCustomerRate(AdditionalRateSummaryPageStatus);
        selectPage.item = 'rateSummary';
        saveSelectPage(selectPage);
      }
    } else if (currentOnSurchargeAmexCardValue === '2' || currentOnSurchargeAmexCardValue === '1') {
      const warmlyWelcomeRatePageStatus = {
        ...moduleState.customerRate,
        currentProvideSurchargeRate: {
          value: 0,
          isValid: true,
        },
        surchargeAnalytics: (customerRateState.currentOnSurchargeAmexCard.value === '2' && 'same')
          || (customerRateState.currentOnSurchargeAmexCard.value === '1' && 'no'),
        customerSurchargeCode: parseInt(customerRateState.currentOnSurchargeAmexCard.value, 10),
      };
      saveCustomerRate(warmlyWelcomeRatePageStatus);
      selectPage.item = 'rateSummary';
      saveSelectPage(selectPage);
    } else {
      const AdditionalRateSummaryPageStatus = {
        ...moduleState.customerRate,
        showAdditionalRatesQuestionsWarnings: true,
      };
      saveCustomerRate(AdditionalRateSummaryPageStatus);
    }
  };

  const imageUrl = `${links.gemUrl}/content/dam/one-amex/accept/images/dma_background_lg.png`;
  const divStyle = {
    width: '250%',
    height: '70px',
    marginLeft: -600,
    marginTop: -10,
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: 'cover',
  };

  return (
    <div>
      {moduleState.customerRate.industryRate === 0.0
        ? (
          <div
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            className="progress-bar progress-indeterminate"
          >
            <div className="progress-track" />
          </div>
        ) : (
          <Wizard>
            <Steps>
              <Step
                // id is 'element'
                id={analytics.AMEXRATE_ELEMENTONE}
                meta={{
                  journey: `${analytics.JOURNEY}`,
                  applicationId,
                  initialRate: initialRateAnalytics,
                }}
                // this block is the 'detail'
                onVisibleProps={{
                  identifier: `${analytics.AMEXRATE_DETAIL}`,
                }}
              >
                <div>
                <div className="row negative-margin">
        <div className="col-md-12">
          <div className="top-accent-bar" />
        </div>
      </div>
                  <div className="col-lg-11 row pad-2-l">
                    <div
                      className="card card-flex card-border col-lg-12 pad-3-l mw-820" style={{ marginTop: -30 }}
                    >
                      <div>
                        <div
                          className="pad-2-t"
                          style={{ marginTop: 6, marginRight: 20, marginBottom: -15 }}
                        >
                          <h1
                            className="heading-1 pad-1-b"
                          >
                            {customerRate.warmlyWelcomeRateHeading}
                          </h1>
                          <BarProgress
                            style={{
                              position: 'absolute',
                              WebkitFilter: 'blur(10px) saturate(2)',
                            }}
                            id="barProgress"
                            currentStep={0}
                            steps={['', '']}
                          />
                        </div>
                        <div className="col-lg-11 pad-2-r pad-0-l">
                          <div className="heading-5 pad-2-b">
                            <p>{customerRate.warmlyWelcomeRateHeader}</p>
                          </div>
                        </div>
                        <div className="col-lg-11 pad-0-l">
                          <div className="heading-3 pad-1-tb">
                            <p>{customerRate.warmlyWelcomeRateSubHeader}</p>
                          </div>
                        </div>
                        {
                          (((customerRateState.discountRate.discountRateAddendaCode === 'ASMP6'
                                && customerRateState.discountRate.fiftyK > 0
                                && customerRateState.discountRate.hundreadK > 0)
                            )
                            || (customerRateState.discountRate.discountRateAddendaCode === 'ASML1'
                              && customerRateState.discountRate.fiveHundreadK > 0)
                              ? (
                                <div className="row margin-1-l">
                                  <div className="row border-dark col-lg-4 pad-3-tb">
                                    <div className="flex flex-justify-center">
                                      <div className="pad-1">
                                        <p className="heading-4 Bold flex flex-justify-center ft-size-20 ft-600">
                                          <b>
                                            {(customerRateState.discountRate.discountRateAddendaCode === 'ASMP6') && customerRateState.discountRate.fiftyK}
                                            {(customerRateState.discountRate.discountRateAddendaCode === 'ASML1') && customerRateState.discountRate.fiveHundreadK}
                                            %
                                          </b>
                                        </p>
                                        <p className="body-1 pad-2-l pad-2-r" style={{ textAlign: 'center' }}>
                                          {(customerRateState.discountRate.discountRateAddendaCode === 'ASMP6') && customerRate.CardOneText}
                                          {(customerRateState.discountRate.discountRateAddendaCode === 'ASML1') && customerRate.CardThreeText}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="rrow col-lg-2 pad-4 margin-3-tb ft-700 ft-size-20">
                                    <b>
                                      THEN
                                    </b>
                                  </div>
                                  <div className="row border-dark col-lg-4 pad-3-tb margin-3-l">
                                    <div className="flex flex-justify-center">
                                      <div className="pad-1">
                                        <p className="heading-4 Bold flex flex-justify-center">
                                          <b>
                                            {(customerRateState.discountRate.discountRateAddendaCode === 'ASMP6') && customerRateState.discountRate.hundreadK}
                                            {(customerRateState.discountRate.discountRateAddendaCode === 'ASML1') && customerRateState.warmlyWelcomeRate}
                                            %
                                          </b>
                                        </p>
                                        <p className="body-1" style={{ textAlign: 'center' }}>
                                          {(customerRateState.discountRate.discountRateAddendaCode === 'ASMP6') && customerRate.CardTwoText}
                                          {(customerRateState.discountRate.discountRateAddendaCode === 'ASML1') && customerRate.CardFourText}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                              : ((customerRateState.discountRate.fiftyK === 0
                                  && customerRateState.discountRate.fiveHundreadK === 0)
                                && (
                                  <div className="col-lg-11 pad-0-l">
                                    <div className="heading-4 pad-1-b">
                                      <p style={{ maxWidth: '710px' }}>
                                        {customerRateState.warmlyWelcomeRate}
                                        %
                                        <sup>*</sup>
                                      </p>
                                    </div>
                                  </div>
                                )
                              )
                          )
                        }

                        <div style={{ maxWidth: '630px' }}>
                          <div className="body-1 pad-2-t">
                            <p>{customerRate.rateFooterParaOne}</p>
                          </div>
                          <div className="body-1 pad-2-tb">
                            <p>{customerRate.rateFooterParaTwo}</p>
                          </div>
                        </div>
                        <div>
                          <div className="col-lg-6 pad-2-t pad-0-l">
                            <div>
                              <Dropdown
                                id="surchargeAmexCards"
                                selectClassName="select-fluid"
                                label={(
                                  <div>
                                    {customerRate.surchargeQuestionLabel}
                                    <Tooltip
                                      className="test-class"
                                      label="tooltip label"
                                      position="right"
                                      contentId="business-profile-tooltip"
                                      tooltipBox={{
                                        left: 10,
                                        right: 70,
                                        bottom: 85,
                                      }}
                                      toggleBox={{
                                        left: 150,
                                        right: 70,
                                        bottom: 20,
                                      }}
                                    >
                                      <span className="tooltip-content">
                                        <strong>
                                          {customerRate.additionalRateToolTipText}
                                        </strong>
                                      </span>
                                    </Tooltip>
                                  </div>
                                )}
                                options={customerRate.surchargeQuestionOptions}
                                value={customerRateState.currentOnSurchargeAmexCard.value}
                                onChange={handleOnChangeSurchargeAmexCards}
                                warning={(customerRateState.showAdditionalRatesQuestionsWarnings)
                                  ? errors.CustomerRatePage.provideSurchargeCardOption
                                  : null}
                              />
                              {(customerRateState.currentOnSurchargeAmexCard.value === '3')
                              && (
                                <Input
                                  id="setSurchargeRate"
                                  label={customerRate.surchargeRateQuestion}
                                  value={customerRateState.currentProvideSurchargeRate.value}
                                  maxLength={5}
                                  onChange={onProvideSurchargeRate}
                                  warning={customerRateState.showAdditionalRatesProvideWarnings
                                  && errors.CustomerRatePage.incorrectSurchargeRate}
                                />
                              )
                              }
                            </div>
                          </div>
                        </div>
                        <div className="pad-25-b">
                          <div className="row">
                            <div className="col-lg-12 margin-2-t pad-0-l">
                              <div className="row margin-2-r margin-1-l border-t pad-25-b">
                                <div
                                  className="col-lg-12"
                                  style={{ marginRight: 20, marginLeft: 10 }} 
                                />
                              </div>
                              <div className="row">
                                <div className="col-lg-8 flex-align-center flex">
                                  <Icon
                                    id="backButtonOne"
                                    className="icon icon-md dls-icon-left"
                                    iconSize="small"
                                    onClick={onClickMoveToTocPage}
                                  />
                                  <Anchor
                                    id="backButtonTwo"
                                    label={customerRate.BackButton}
                                    className="margin-3-r margin-1-l"
                                    style={{ color: '#000000' }}
                                    onClick={onClickMoveToTocPage}
                                  />
                                </div>
                                <div className="col-md-4 pad-3-r">
                                  <Button
                                    id="saveAndContinueButton"
                                    label="Save and Continue"
                                    title="Continue"
                                    onClick={onClickChangeStateOne}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Step>
            </Steps>
          </Wizard>
        )
      }
    </div>
  );
};

MerchantRate.propTypes = {
  updateContextPath: PropTypes.func.isRequired,
  customerRate: PropTypes.shape({
    warmlyWelcomeRateHeader: PropTypes.string,
    warmlyWelcomeRateSubHeader: PropTypes.string,
    warmlyWelcomeRateHeading: PropTypes.string,
    CardOneText: PropTypes.string,
    CardTwoText: PropTypes.string,
    CardThreeText: PropTypes.string,
    CardFourText: PropTypes.string,
    rateFooterParaOne: PropTypes.string,
    rateFooterParaTwo: PropTypes.string,
    surchargeQuestionLabel: PropTypes.string,
    surchargeQuestionOptions: PropTypes.instanceOf(Array),
    surchargeRateQuestion: PropTypes.string,
    BackButton: PropTypes.string,
    yourAmexRate: PropTypes.string,
    additionalRateToolTipText: PropTypes.string,
  }),
  errors: PropTypes.shape({
    CustomerRatePage: PropTypes.shape({
      incorrectSurchargeRate: PropTypes.string,
      provideSurchargeRate: PropTypes.string,
      provideSurchargeCardOption: PropTypes.string,
    }),
  }),
  links: {
    gemUrl: PropTypes.string,
  },
  selectPage: PropTypes.node,
  dmaGetPricingRate: PropTypes.func.isRequired,
  moduleState: PropTypes.node,
  saveCustomerRate: PropTypes.func,
  saveSelectPage: PropTypes.func,
};

MerchantRate.defaultProps = {
  customerRate: PropTypes.shape({
    customerRate: PropTypes.shape({
      warmlyWelcomeRateHeader: null,
      warmlyWelcomeRateSubHeader: null,
    }),
  }),
  errors: PropTypes.shape({
    CustomerRatePage: PropTypes.shape({
      incorrectSurchargeRate: null,
      provideSurchargeRate: null,
      provideSurchargeCardOption: null,
    }),
  }),
  links: {
    gemUrl: '',
  },
  selectPage: null,
  moduleState: null,
  saveCustomerRate: null,
  saveSelectPage: null,
};

export default MerchantRate;

