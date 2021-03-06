
<div class="ui text container">
    <h1 class="ui left aligned header">
        <img class="ui image" src="{{ urlToLogo }}" id="login-logo">
        <div class="content">
            {{ NameFromSettings }}
            <div class="sub header"> {{ DescriptionFromSettings }}</div>
        </div>
    </h1>

    {{ form('session/start', 'role': 'form', 'class': 'ui large form segment', 'id' :'login-form') }}
    <div class="field">
        <label>{{ t._('auth_Login') }}</label>
        <div class="ui left icon input">
            <i class="user icon"></i>
            {{ form.render('login') }}
        </div>
    </div>
    <div class="field">
        <label>{{ t._('auth_Password') }}</label>
        <div class="ui left icon input">
            <i class="lock icon"></i>
            {{ form.render('password') }}
        </div>
    </div>

    <div class="ui error message"></div>
    <button type="submit" class="ui fluid large black button" id="submitbutton">
        {{ t._('auth_SubmitButton') }}
    </button>
    </form>
</div>