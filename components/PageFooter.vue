<template>
  <footer
    data-qa="footer"
    class="p-3"
  >
    <b-container>
      <ul
        v-if="links"
        class="footer-link-list m-0 p-0"
      >
        <li
          v-for="(footerLink, index) in links"
          :key="index"
        >
          <template
            v-if="footerLink.url"
          >
            <SmartLink
              :destination="footerLink.url"
              link-class="footer-link"
            >
              {{ footerLink.text }}
            </SmartLink>
          </template>
          <p v-else>
            {{ footerLink.text }}
          </p>
        </li>
      </ul>
    </b-container>
    <no-ssr>
      <!--  TODO: replace link destination local one -->
      <cookie-law
        button-class="btn btn-outline-primary primary btn-lg"
        button-link="https://www.europeana.eu/portal/rights/privacy.html"
        :button-link-text="$t('cookieNotice.linkText')"
        :button-text="$t('cookieNotice.buttonText')"
        :message="$t('cookieNotice.message')"
        data-qa="cookie notice"
      />
    </no-ssr>
  </footer>
</template>

<script>
  import CookieLaw from 'vue-cookie-law';
  import SmartLink from './generic/SmartLink';

  export default {
    components: {
      CookieLaw,
      SmartLink
    },
    computed: {
      links() {
        return this.$store.state['link-group'].links.footer;
      }
    }
  };
</script>

<style lang="scss">
  @import '../assets/scss/variables.scss';

  footer {
    background-color: $darkblue;
    color: #fff;

    .Cookie {
      background-color: $white;
    }
    .Cookie--base {
      color: $darkgrey;
    }
  }
</style>
