import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'

/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticationController::show
* @route '/user/two-factor-authentication'
*/
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get"],
    url: '/user/two-factor-authentication',
} satisfies RouteDefinition<["get"]>

show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticationController::store
* @route '/user/two-factor-authentication'
*/
export const enable = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enable.url(options),
    method: 'post',
})

enable.definition = {
    methods: ["post"],
    url: '/user/two-factor-authentication',
} satisfies RouteDefinition<["post"]>

enable.url = (options?: RouteQueryOptions) => {
    return enable.definition.url + queryParams(options)
}

enable.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enable.url(options),
    method: 'post',
})

const enableForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: enable.url(options),
    method: 'post',
})

export function enableForm_f(options?: RouteQueryOptions) {
    return enableForm(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticationController::destroy
* @route '/user/two-factor-authentication'
*/
export const disable = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: disable.url(options),
    method: 'delete',
})

disable.definition = {
    methods: ["delete"],
    url: '/user/two-factor-authentication',
} satisfies RouteDefinition<["delete"]>

disable.url = (options?: RouteQueryOptions) => {
    return disable.definition.url + queryParams(options)
}

disable.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: disable.url(options),
    method: 'delete',
})

const disableForm = (options?: RouteQueryOptions): RouteFormDefinition<'delete'> => ({
    action: disable.url(options),
    method: 'delete',
})

export function disableForm_f(options?: RouteQueryOptions) {
    return disableForm(options)
}
